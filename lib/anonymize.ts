import { createClient } from '@/lib/supabase/client'

const API_URL = (process.env.NEXT_PUBLIC_ANONYMIZE_API_URL ?? 'http://localhost:8001').replace(/\/$/, '')

export type RedactMode = 'dash' | 'rectangle' | 'highlight'

export interface JobSummary {
  job_id: string
  redact_mode: string
  page_count: number
  redacted_pages: number
  entity_counts: Record<string, number>
  rodo_compliant: boolean
}

export interface AnonymizeProgress {
  phase: 'pending' | 'processing'
  estimatedWaitSeconds?: number | null
  pageCount?: number | null
}

type JobStatus = 'pending' | 'processing' | 'done' | 'failed' | 'unsupported'

export class AnonymizeError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message)
  }
}

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Plik nie jest prawidłowym dokumentem PDF.',
  401: 'Brak autoryzacji – zaloguj się ponownie.',
  402: 'Przekroczono limit stron w planie. Uzupełnij środki lub zmień plan.',
  403: 'Brak aktywnej subskrypcji Premium.',
  404: 'Zadanie nie istnieje lub wygasło.',
  409: 'Plik nie jest jeszcze gotowy – spróbuj za chwilę.',
  413: 'Plik jest za duży (maksymalnie 20 MB).',
  503: 'Serwis jest chwilowo przeciążony – spróbuj za kilka sekund.',
}

const JOB_ERROR_CODES: Record<string, string> = {
  password_protected:  'Plik jest zabezpieczony hasłem – usuń hasło i spróbuj ponownie.',
  corrupted:           'Plik PDF jest uszkodzony lub nieprawidłowy.',
  too_many_pages:      'Plik ma zbyt wiele stron.',
  scan_only:           'Plik zawiera wyłącznie skany – tekst nie jest możliwy do przetworzenia.',
}

export async function getAccessToken(): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new AnonymizeError('Brak autoryzacji – zaloguj się ponownie.', 401)
  return data.session.access_token
}

async function apiFetch(
  path: string,
  token: string,
  options?: { method?: string; body?: FormData }
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers: { Authorization: `Bearer ${token}` },
    ...(options?.body !== undefined ? { body: options.body } : {}),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const raw: unknown = body.detail ?? body.error ?? body.code
    const apiDetail = raw !== undefined
      ? Array.isArray(raw)
        ? raw.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join('; ')
        : String(raw)
      : undefined
    const userMessage = HTTP_ERROR_MESSAGES[res.status] ?? `Błąd serwera (${res.status}).`
    throw new AnonymizeError(userMessage, res.status, apiDetail)
  }

  return res
}

/** Wyślij plik PDF do anonimizacji. Zwraca job_id i szacowany czas oczekiwania. */
export async function submitFile(
  file: File,
  token: string,
  redactMode: RedactMode = 'dash'
): Promise<{ jobId: string; estimatedWaitSeconds: number | null }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('redact_mode', redactMode)
  const res = await apiFetch('/process', token, { method: 'POST', body: formData })
  const data = await res.json()
  const jobId: string = data.job_id
  if (!jobId || typeof jobId !== 'string') {
    throw new AnonymizeError('Serwer nie zwrócił identyfikatora zadania.', 500, JSON.stringify(data))
  }
  const estimatedWaitSeconds: number | null =
    typeof data.estimated_wait_seconds === 'number' ? data.estimated_wait_seconds : null
  return { jobId, estimatedWaitSeconds }
}

/** Sprawdź status zadania jednorazowo. */
export async function pollJob(
  jobId: string,
  token: string
): Promise<{ status: JobStatus; error?: string | null; pageCount?: number | null }> {
  const res = await apiFetch(`/jobs/${jobId}`, token)
  const data = await res.json()
  return {
    status:    data.status as JobStatus,
    error:     data.error ?? null,
    pageCount: typeof data.page_count === 'number' ? data.page_count : null,
  }
}

/** Pobierz gotowy zanonimizowany PDF wraz z podsumowaniem z X-Job-Summary. */
export async function fetchResultPdf(
  jobId: string,
  token: string
): Promise<{ blob: Blob; summary: JobSummary }> {
  const res = await apiFetch(`/jobs/${jobId}/download`, token)
  const raw = res.headers.get('X-Job-Summary')
  const summary: JobSummary = raw
    ? (JSON.parse(raw) as JobSummary)
    : {
        job_id: jobId,
        redact_mode: 'dash',
        page_count: 0,
        redacted_pages: 0,
        entity_counts: {},
        rodo_compliant: true,
      }
  const blob = await res.blob()
  return { blob, summary }
}

/**
 * Wyślij plik PDF i czekaj na wynik (polling co intervalMs ms).
 * onProgress: wywoływane po POST (phase=pending) i przy zmianie statusu na processing.
 */
export async function anonymizeFile(
  file: File,
  token: string,
  redactMode: RedactMode = 'dash',
  options: {
    intervalMs?: number
    timeoutMs?: number
    onProgress?: (progress: AnonymizeProgress) => void
  } = {}
): Promise<{ blob: Blob; summary: JobSummary }> {
  const { intervalMs = 2500, timeoutMs = 600_000, onProgress } = options

  const { jobId, estimatedWaitSeconds } = await submitFile(file, token, redactMode)
  onProgress?.({ phase: 'pending', estimatedWaitSeconds })

  const deadline = Date.now() + timeoutMs
  let lastPhase: 'pending' | 'processing' = 'pending'

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, intervalMs))
    const poll = await pollJob(jobId, token)

    if (poll.status === 'done') return fetchResultPdf(jobId, token)

    if (poll.status === 'failed') {
      throw new AnonymizeError(
        'Przetwarzanie nie powiodło się. Spróbuj ponownie.',
        500,
        poll.error ?? undefined
      )
    }

    if (poll.status === 'unsupported') {
      const reason = poll.error
        ? (JOB_ERROR_CODES[poll.error] ?? `Nieobsługiwany format PDF (${poll.error}).`)
        : 'Ten format PDF nie jest obsługiwany.'
      throw new AnonymizeError(reason, 422)
    }

    if (poll.status === 'processing' && lastPhase !== 'processing') {
      lastPhase = 'processing'
      onProgress?.({ phase: 'processing', pageCount: poll.pageCount ?? null })
    }
  }

  throw new AnonymizeError('Przekroczono czas oczekiwania na wynik. Spróbuj ponownie.', 504)
}

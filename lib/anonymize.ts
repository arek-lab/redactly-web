import { createClient } from '@/lib/supabase/client'

const API_URL = (process.env.NEXT_PUBLIC_ANONYMIZE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export class AnonymizeError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message)
  }
}

export async function getAccessToken(): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new AnonymizeError('Not authenticated', 401)
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
    const raw: unknown = body.detail ?? body.error ?? res.statusText
    const detail = Array.isArray(raw)
      ? raw.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join('; ')
      : String(raw)
    throw new AnonymizeError(`API error ${res.status}`, res.status, detail)
  }

  return res
}

/** Wyślij plik PDF do anonimizacji. Zwraca job_id. */
export async function submitFile(file: File, token: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch('/mask', token, { method: 'POST', body: formData })
  const data = await res.json()
  const jobId: string = data.job_id ?? data.task_id ?? data.id
  if (!jobId || typeof jobId !== 'string') {
    throw new AnonymizeError('Server did not return a valid job_id', 500, JSON.stringify(data))
  }
  return jobId
}

/** Sprawdź status zadania jednorazowo. */
export async function pollJob(
  jobId: string,
  token: string
): Promise<{ status: string; result_url?: string; error?: string }> {
  const res = await apiFetch(`/jobs/${jobId}`, token)
  return res.json()
}

/** Pobierz gotowy zanonimizowany PDF. */
export async function fetchResultPdf(jobId: string, token: string): Promise<Blob> {
  const res = await apiFetch(`/jobs/${jobId}/result`, token)
  return res.blob()
}

/**
 * Wyślij plik PDF i czekaj na wynik (polling co intervalMs ms).
 * Zwraca Blob z zanonimizowanym PDF.
 */
export async function anonymizeFile(
  file: File,
  token: string,
  options: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<Blob> {
  const { intervalMs = 1500, timeoutMs = 30_000 } = options

  const jobId = await submitFile(file, token)
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, intervalMs))
    const poll = await pollJob(jobId, token)

    if (poll.status === 'done') return fetchResultPdf(jobId, token)
    if (poll.status === 'failed') {
      throw new AnonymizeError('Anonymization failed', 500, poll.error)
    }
  }

  throw new AnonymizeError('Timeout waiting for anonymization result', 504)
}

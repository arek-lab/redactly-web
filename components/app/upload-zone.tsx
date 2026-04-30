'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePdfProcessor } from '@/hooks/usePdfProcessor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RedactMode } from '@/lib/anonymize'

const FREE_STAGES = [
  'Ekstrakcja tekstu...',
  'Wykrywanie danych...',
  'Anonimizacja PDF...',
]

const PROCESSING_MESSAGES = [
  'Analiza struktury dokumentu...',
  'Wykrywanie danych osobowych...',
  'Anonimizacja treści...',
  'Weryfikacja wyników...',
  'Finalizowanie...',
  'Jeszcze chwila...',
]

const REDACT_MODES: { id: RedactMode; label: string }[] = [
  { id: 'dash',      label: 'Anonimizacja' },
  { id: 'highlight', label: 'Zaznaczenie danych osobowych' },
]

export interface UploadZoneProps {
  isLoggedIn: boolean
  isPremium: boolean
}

function formatElapsed(s: number): string {
  const m   = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function pageLabel(n: number): string {
  if (n === 1) return '1 strona w dokumencie'
  if (n < 5)   return `${n} strony w dokumencie`
  return `${n} stron w dokumencie`
}

export function UploadZone({ isLoggedIn, isPremium }: UploadZoneProps) {
  const { state, processFile, processFilePremium, reset } = usePdfProcessor()
  const inputRef    = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging]   = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [redactMode, setRedactMode]   = useState<RedactMode>('dash')
  const [elapsed, setElapsed]         = useState(0)
  const [msgIdx, setMsgIdx]           = useState(0)
  const [countdown, setCountdown]     = useState<number | null>(null)
  const dragCounter = useRef(0)
  const router = useRouter()

  // Derived — TS narrows state.premiumPhase / estimatedWait / pageCount safely
  const isProcessingPremium = state.status === 'processing' && isPremium
  const premiumPhase  = isProcessingPremium ? state.premiumPhase   : undefined
  const estimatedWait = isProcessingPremium ? (state.estimatedWait ?? null) : null
  const pageCount     = isProcessingPremium ? (state.pageCount     ?? null) : null

  // Elapsed timer — całe przetwarzanie premium
  useEffect(() => {
    if (!isProcessingPremium) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isProcessingPremium])

  // Rotacja komunikatów — tylko faza processing
  useEffect(() => {
    if (premiumPhase !== 'processing') { setMsgIdx(0); return }
    const t = setInterval(() => setMsgIdx(i => (i + 1) % PROCESSING_MESSAGES.length), 4000)
    return () => clearInterval(t)
  }, [premiumPhase])

  // Inicjalizacja odliczania z szacowanego czasu oczekiwania
  useEffect(() => {
    if (estimatedWait != null && premiumPhase === 'pending') {
      setCountdown(prev => prev ?? estimatedWait)
    }
    if (premiumPhase === 'processing' || !isProcessingPremium) {
      setCountdown(null)
    }
  }, [estimatedWait, premiumPhase, isProcessingPremium])

  // Tik odliczania co sekundę
  useEffect(() => {
    if (!countdown) return
    const t = setTimeout(() => setCountdown(c => c !== null ? Math.max(0, c - 1) : null), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleReset() {
    setPendingFile(null)
    reset()
    router.refresh()
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  function handleFile(file: File) {
    if (isPremium) {
      setPendingFile(file)
    } else {
      processFile(file)
    }
  }

  function handleSubmit() {
    if (!pendingFile) return
    processFilePremium(pendingFile, redactMode)
    setPendingFile(null)
  }

  function getProgress(stage: 0 | 1 | 2, current: number, total: number): number {
    if (stage === 0) return total > 0 ? Math.round((current / total) * 33) : 5
    if (stage === 1) return 60
    return 85
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={onInputChange}
      />

      {/* Dropzone */}
      {state.status === 'idle' && !pendingFile && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            'w-full flex flex-col items-center justify-center gap-5',
            'rounded-[12px] border-2 border-dashed border-border-mid',
            'bg-bg-surface py-20 px-8 cursor-pointer',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            isDragging
              ? 'border-solid border-accent bg-bg-surface-2'
              : 'hover:border-solid hover:border-accent hover:bg-bg-surface-2',
          )}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-accent shrink-0">
            <path
              d="M24 32V16M24 16L17 23M24 16L31 23"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M8 36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <p className="text-text-primary font-medium">
              Przeciągnij plik PDF lub kliknij, by wybrać
            </p>
            <p className="text-text-muted text-sm mt-1">
              {isPremium
                ? 'Maksymalny rozmiar: 20 MB · Format: PDF'
                : 'Maksymalny rozmiar: 10 MB · Format: PDF'}
            </p>
            {!isLoggedIn && (
              <p className="text-text-muted text-sm mt-2">
                Zaloguj się, by odblokować wersję Premium z pełną anonimizacją NLP.
              </p>
            )}
          </div>
        </button>
      )}

      {/* Wybór trybu — premium, plik wybrany, jeszcze nie wysłany */}
      {state.status === 'idle' && isPremium && pendingFile && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent shrink-0" aria-hidden="true">
              <rect x="3" y="1" width="11" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 1v4h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 8h7M6 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-text-primary font-medium truncate">{pendingFile.name}</p>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[1px] text-text-muted mb-3">
              Tryb przetwarzania
            </p>
            <div className="grid grid-cols-2 rounded-[8px] border border-border-soft bg-bg-surface p-1 gap-1">
              {REDACT_MODES.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setRedactMode(mode.id)}
                  className={cn(
                    'rounded-[6px] px-3 py-2.5 text-[13px] font-medium text-center',
                    'transition-colors duration-150 cursor-pointer',
                    redactMode === mode.id
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {redactMode === 'highlight' && (
              <p className="mt-3 text-[13px] text-text-secondary rounded-[8px] border border-border-soft bg-bg-surface px-4 py-3">
                Dane osobowe zostaną zaznaczone, nie usunięte. Plik będzie zawierał oryginalne wartości.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="accent" size="lg" onClick={handleSubmit} className="flex-1">
              Wyślij do anonimizacji
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setPendingFile(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              Anuluj
            </Button>
          </div>
        </div>
      )}

      {/* Processing — premium: faza kolejki */}
      {state.status === 'processing' && isPremium && premiumPhase === 'pending' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-mid bg-bg-surface px-4 py-2 text-sm font-medium text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-text-muted animate-pulse" />
              W kolejce
            </span>
          </div>

          <p className="text-center text-text-primary font-medium">
            {estimatedWait !== null ? 'Oczekiwanie w kolejce...' : 'Wysyłanie pliku...'}
          </p>

          {countdown !== null && (
            <p className="text-center text-text-secondary text-sm">
              {countdown > 0
                ? `Szacowany czas oczekiwania: ~${countdown} s`
                : 'Zaraz Twoja kolej...'}
            </p>
          )}

          <div className="relative h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            {estimatedWait != null && estimatedWait > 0 && countdown !== null ? (
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-1000"
                style={{ width: `${Math.max(0, (countdown / estimatedWait) * 100)}%` }}
              />
            ) : (
              <div className="absolute inset-y-0 w-1/3 rounded-full bg-accent animate-progress-slide" />
            )}
          </div>

          <p className="text-center text-text-muted text-sm tabular-nums">
            {formatElapsed(elapsed)}
          </p>
        </div>
      )}

      {/* Processing — premium: faza przetwarzania */}
      {state.status === 'processing' && isPremium && premiumPhase === 'processing' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Przetwarzanie
            </span>
          </div>

          <p key={msgIdx} className="text-center text-text-primary font-medium animate-fade-up">
            {PROCESSING_MESSAGES[msgIdx]}
          </p>

          {pageCount !== null && (
            <p className="text-center text-text-secondary text-sm">
              {pageLabel(pageCount)}
            </p>
          )}

          <div className="relative h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            <div className="absolute inset-y-0 w-1/3 rounded-full bg-accent animate-progress-slide" />
          </div>

          <p className="text-center text-text-muted text-sm tabular-nums">
            {formatElapsed(elapsed)}
          </p>
        </div>
      )}

      {/* Processing — free: etapy z paskiem określonym */}
      {state.status === 'processing' && !isPremium && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-5">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Przetwarzanie
            </span>
          </div>
          <p className="text-center text-text-primary font-medium">
            {FREE_STAGES[state.stage]}
          </p>
          {state.stage === 0 && state.pageProgress.total > 0 && (
            <p className="text-center text-text-secondary text-sm">
              Strona {state.pageProgress.current} z {state.pageProgress.total}
            </p>
          )}
          <div className="relative h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-500"
              style={{ width: `${getProgress(state.stage, state.pageProgress.current, state.pageProgress.total)}%` }}
            />
          </div>
        </div>
      )}

      {/* Done — brak dopasowań (free tier) */}
      {state.status === 'done' && state.noMatches && !state.isPremium && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-ok/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-ok">
                <path d="M6 14L11 19L22 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              Nie wykryto danych osobowych (PESEL, karta, IBAN) w tym dokumencie.
            </p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="lg" onClick={handleReset}>
              Przetwórz kolejny plik
            </Button>
          </div>
        </div>
      )}

      {/* Done — premium */}
      {state.status === 'done' && state.isPremium && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-ok/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-ok">
                <path d="M6 14L11 19L22 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-text-primary font-semibold text-lg">Przetwarzanie zakończone</p>
          </div>

          {state.rodoCompliant === false && !state.noMatches && (
            <div className="rounded-[8px] border border-badge-found/30 bg-badge-found/10 px-4 py-3 text-sm text-text-secondary">
              Uwaga: plik zawiera oryginalne dane osobowe – tryb zaznaczenia, nie anonimizacji.
            </div>
          )}

          {state.noMatches ? (
            <p className="text-center text-text-secondary text-sm">
              Nie wykryto danych osobowych w tym dokumencie.
            </p>
          ) : state.entityCounts && (
            (() => {
              const total = Object.values(state.entityCounts).reduce((a, b) => a + b, 0)
              return total > 0 ? (
                <div className="flex justify-center">
                  <div className="rounded-[8px] border border-border-soft bg-bg-surface px-10 py-5 text-center">
                    <p className="text-3xl font-semibold text-text-primary tabular-nums">{total}</p>
                    <p className="text-xs text-text-muted mt-1">wykryte dane osobowe</p>
                  </div>
                </div>
              ) : null
            })()
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={state.downloadUrl}
              download={state.downloadName}
              className={cn(
                'flex-1 inline-flex items-center justify-center',
                'h-12 px-7 text-base font-medium rounded-[7px]',
                'bg-accent text-white transition-opacity duration-150',
                'hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              )}
            >
              Pobierz zanonimizowany PDF
            </a>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Przetwórz kolejny plik
            </Button>
          </div>
        </div>
      )}

      {/* Done — free tier z dopasowaniami */}
      {state.status === 'done' && !state.isPremium && !state.noMatches && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-ok/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-ok">
                <path d="M6 14L11 19L22 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-text-primary font-semibold text-lg">Anonimizacja zakończona</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { label: 'PESEL', count: state.summary.PESEL },
                { label: 'Karta płatnicza', count: state.summary.KARTA },
                { label: 'IBAN', count: state.summary.IBAN },
              ] as const
            ).map(({ label, count }) => (
              <div key={label} className="rounded-[8px] border border-border-soft bg-bg-surface px-3 py-4 text-center">
                <p className="text-2xl font-semibold text-text-primary">{count}</p>
                <p className="text-xs text-text-muted mt-1">{label}</p>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="rounded-[8px] border border-border-soft bg-bg-surface px-4 py-3 text-sm text-text-secondary">
              Wersja demonstracyjna – tekst zasłonięty, nie usunięty ze strumienia PDF.{' '}
              Dla pełnej zgodności z RODO użyj wersji Premium.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={state.downloadUrl}
              download={state.downloadName}
              className={cn(
                'flex-1 inline-flex items-center justify-center',
                'h-12 px-7 text-base font-medium rounded-[7px]',
                'bg-accent text-white transition-opacity duration-150',
                'hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              )}
            >
              Pobierz zanonimizowany PDF
            </a>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Przetwórz kolejny plik
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-found/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-found">
                <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
                <path d="M14 9V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="14" cy="19" r="1.25" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-semibold">Błąd</p>
              <p className="text-text-secondary text-sm mt-1">{state.message}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="accent" size="lg" onClick={handleReset}>
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

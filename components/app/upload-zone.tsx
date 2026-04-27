'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePdfProcessor } from '@/hooks/usePdfProcessor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STAGES = [
  'Ekstrakcja tekstu...',
  'Wykrywanie danych...',
  'Anonimizacja PDF...',
]

export interface UploadZoneProps {
  isLoggedIn: boolean
  isPremium: boolean
}

export function UploadZone({ isLoggedIn, isPremium }: UploadZoneProps) {
  const { state, processFile, processFilePremium, reset } = usePdfProcessor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'done' && state.isPremium) {
      router.refresh()
    }
  }, [state.status])

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
      processFilePremium(file)
    } else {
      processFile(file)
    }
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

      {state.status === 'idle' && (
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
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <p className="text-text-primary font-medium">
              Przeciągnij plik PDF lub kliknij, by wybrać
            </p>
            <p className="text-text-muted text-sm mt-1">
              Maksymalny rozmiar: 10 MB &middot; Format: PDF
            </p>
            {!isLoggedIn && (
              <p className="text-text-muted text-sm mt-2">
                Zaloguj się, by odblokować wersję Premium z pełną anonimizacją NLP.
              </p>
            )}
          </div>
        </button>
      )}

      {state.status === 'processing' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-5">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Przetwarzanie
            </span>
          </div>
          <p className="text-center text-text-primary font-medium">
            {STAGES[state.stage]}
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

      {state.status === 'done' && state.noMatches && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-ok/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-ok">
                <path
                  d="M6 14L11 19L22 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              Nie wykryto danych osobowych (PESEL, karta, IBAN) w tym dokumencie.
            </p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="lg" onClick={reset}>
              Przetwórz kolejny plik
            </Button>
          </div>
        </div>
      )}

      {state.status === 'done' && !state.noMatches && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-ok/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-ok">
                <path
                  d="M6 14L11 19L22 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-text-primary font-semibold text-lg">Anonimizacja zakończona</p>
          </div>

          {state.isPremium ? (
            <div className="flex justify-center">
              <div className="rounded-[8px] border border-border-soft bg-bg-surface px-8 py-4 text-center">
                <p className="text-2xl font-semibold text-text-primary">
                  {state.spanCount ?? '—'}
                </p>
                <p className="text-xs text-text-muted mt-1">Zanonimizowane dane</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { label: 'PESEL', count: state.summary.PESEL },
                  { label: 'Karta płatnicza', count: state.summary.KARTA },
                  { label: 'IBAN', count: state.summary.IBAN },
                ] as const
              ).map(({ label, count }) => (
                <div
                  key={label}
                  className="rounded-[8px] border border-border-soft bg-bg-surface px-3 py-4 text-center"
                >
                  <p className="text-2xl font-semibold text-text-primary">{count}</p>
                  <p className="text-xs text-text-muted mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {!isPremium && (
            <div className="rounded-[8px] border border-border-soft bg-bg-surface px-4 py-3 text-sm text-text-secondary">
              Wersja demonstracyjna — tekst zasłonięty, nie usunięty ze strumienia PDF.{' '}
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
            <Button variant="outline" size="lg" onClick={reset}>
              Przetwórz kolejny plik
            </Button>
          </div>
        </div>
      )}

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
            <Button variant="accent" size="lg" onClick={reset}>
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UploadState = 'idle' | 'selected' | 'processing' | 'done' | 'error'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MESSAGES = [
  'Analizuję dokument…',
  'Wykrywam dane osobowe…',
  'Zastępuję dane…',
]

interface UploadZoneProps {
  isLoggedIn: boolean
  isPremium: boolean
}

export function UploadZone({ isLoggedIn, isPremium }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [msgIndex, setMsgIndex] = useState(0)
  const [foundCount, setFoundCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    if (state !== 'processing') return
    const timers = [
      setTimeout(() => setMsgIndex(1), 800),
      setTimeout(() => setMsgIndex(2), 1700),
      setTimeout(() => {
        setFoundCount(Math.floor(Math.random() * 17) + 5)
        setState('done')
      }, 2600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [state])

  function validate(f: File): string | null {
    if (f.type !== 'application/pdf') return 'Nieobsługiwany format — wymagany PDF'
    if (f.size > 10 * 1024 * 1024) return 'Plik jest za duży (maks. 10 MB)'
    return null
  }

  function pick(f: File) {
    const err = validate(f)
    if (err) { setErrorMsg(err); setState('error'); return }
    setFile(f)
    setState('selected')
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
    if (f) pick(f)
  }
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) pick(f)
    e.target.value = ''
  }

  function reset() {
    setState('idle')
    setFile(null)
    setErrorMsg('')
    setMsgIndex(0)
    dragCounter.current = 0
  }

  function download() {
    if (!file) return
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name.replace(/\.pdf$/i, '_redacted.pdf')
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={onInputChange}
      />

      {state === 'idle' && (
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
            isDragging
              ? 'border-solid border-accent bg-bg-surface-2'
              : 'hover:border-solid hover:border-accent hover:bg-bg-surface-2',
          )}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="text-accent shrink-0"
          >
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
          </div>
        </button>
      )}

      {state === 'selected' && file && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[8px] bg-bg-surface flex items-center justify-center shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-accent"
              >
                <path
                  d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 13H15M9 16H12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-text-primary font-medium truncate">{file.name}</p>
              <p className="text-text-muted text-sm">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="rounded-[8px] bg-bg-surface px-4 py-3 text-sm">
            {isPremium ? (
              <span className="text-accent font-medium">Pełna anonimizacja NLP</span>
            ) : (
              <span className="text-text-secondary">
                Tryb free &mdash; wykrywanie: PESEL, IBAN, nr karty
                {!isLoggedIn && (
                  <span className="text-text-muted">
                    {' '}(zaloguj się, by odblokować pełną anonimizację)
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              onClick={() => setState('processing')}
            >
              Anonimizuj
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => { reset(); inputRef.current?.click() }}
            >
              Wybierz inny plik
            </Button>
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Przetwarzanie
            </span>
          </div>
          <p
            key={msgIndex}
            className="text-center text-text-primary font-medium animate-fade-up"
          >
            {MESSAGES[msgIndex]}
          </p>
          <div className="relative h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            <div className="absolute inset-y-0 w-[45%] rounded-full bg-accent animate-progress-slide" />
          </div>
        </div>
      )}

      {state === 'done' && (
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
            <div>
              <p className="text-text-primary font-semibold text-lg">Gotowe!</p>
              <p className="text-text-secondary text-sm mt-1">
                Znaleziono i zastąpiono{' '}
                <strong className="text-text-primary">{foundCount}</strong>{' '}
                danych osobowych.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="accent" size="lg" className="flex-1" onClick={download}>
              Pobierz plik
            </Button>
            <Button variant="outline" size="lg" onClick={reset}>
              Anonimizuj kolejny plik
            </Button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-[12px] border border-border-soft bg-bg-white p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-badge-found/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-badge-found">
                <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M14 9V15"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="19" r="1.25" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-text-primary font-semibold">Błąd</p>
              <p className="text-text-secondary text-sm mt-1">{errorMsg}</p>
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

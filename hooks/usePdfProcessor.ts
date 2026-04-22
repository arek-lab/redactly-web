'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  extractTextItems,
  detectAndMask,
  redactPdf,
  summarize,
} from '@/lib/pdf'
import type { PiiMatch, PiiSummary } from '@/lib/pdf'
import {
  anonymizeFile,
  getAccessToken,
  AnonymizeError,
} from '@/lib/anonymize'

type ProcessorState =
  | { status: 'idle' }
  | { status: 'processing'; stage: 0 | 1 | 2; pageProgress: { current: number; total: number } }
  | { status: 'done'; downloadUrl: string; downloadName: string; summary: PiiSummary; noMatches: boolean; isPremium?: boolean; spanCount?: number | null }
  | { status: 'error'; message: string }

const MAX_SIZE = 10 * 1024 * 1024

export function usePdfProcessor(): {
  state: ProcessorState
  processFile: (file: File) => Promise<void>
  processFilePremium: (file: File) => Promise<void>
  reset: () => void
} {
  const [state, setState] = useState<ProcessorState>({ status: 'idle' })
  const objectUrlRef = useRef<string | null>(null)

  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setState({ status: 'idle' })
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const processFilePremium = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setState({ status: 'error', message: 'Wybierz plik PDF.' })
      return
    }
    if (file.size > MAX_SIZE) {
      setState({
        status: 'error',
        message: `Plik jest za duży (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksymalny rozmiar to 10 MB.`,
      })
      return
    }

    try {
      setState({ status: 'processing', stage: 1, pageProgress: { current: 0, total: 1 } })

      const token = await getAccessToken()
      const { blob, spanCount } = await anonymizeFile(file, token)

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      const downloadUrl = URL.createObjectURL(blob)
      objectUrlRef.current = downloadUrl

      const baseName = file.name.replace(/\.pdf$/i, '')

      setState({
        status: 'done',
        downloadUrl,
        downloadName: `${baseName}_zanonimizowany.pdf`,
        summary: { PESEL: 0, KARTA: 0, IBAN: 0 },
        noMatches: false,
        isPremium: true,
        spanCount,
      })
    } catch (err) {
      const message =
        err instanceof AnonymizeError
          ? (err.detail ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Nieznany błąd przetwarzania.'
      setState({ status: 'error', message })
    }
  }, [])

  const processFile = useCallback(async (file: File) => {

    if (file.type !== 'application/pdf') {
      setState({ status: 'error', message: 'Wybierz plik PDF.' })
      return
    }
    if (file.size > MAX_SIZE) {
      setState({ status: 'error', message: `Plik jest za duży (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksymalny rozmiar to 10 MB.` })
      return
    }

    try {
      setState({ status: 'processing', stage: 0, pageProgress: { current: 0, total: 1 } })

      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      // stage 0 — extract
      const { items, fullText, offsetMap } = await extractTextItems(bytes, {
        onProgress: (current, total) =>
          setState({ status: 'processing', stage: 0, pageProgress: { current, total } }),
      })

      // stage 1 — detect & mask
      setState({ status: 'processing', stage: 1, pageProgress: { current: 0, total: 1 } })
      const { matches, maskedText } = detectAndMask(fullText)

      if (maskedText.length !== fullText.length) {
        throw new Error(`Invariant naruszony: długość maskedText (${maskedText.length}) !== fullText (${fullText.length})`)
      }

      if (matches.length === 0) {
        setState({
          status: 'done',
          noMatches: true,
          summary: { PESEL: 0, KARTA: 0, IBAN: 0 },
          downloadUrl: '',
          downloadName: '',
        })
        return
      }

      // stage 2 — redact PDF
      setState({ status: 'processing', stage: 2, pageProgress: { current: 0, total: 1 } })
      const redactedBytes = await redactPdf(bytes, matches, items, offsetMap)

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      const blob = new Blob([redactedBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' })
      const downloadUrl = URL.createObjectURL(blob)
      objectUrlRef.current = downloadUrl

      const baseName = file.name.replace(/\.pdf$/i, '')
      const downloadName = `${baseName}_zanonimizowany.pdf`

      setState({
        status: 'done',
        downloadUrl,
        downloadName,
        summary: summarize(matches),
        noMatches: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd przetwarzania.'
      setState({ status: 'error', message })
    }
  }, [])

  return { state, processFile, processFilePremium, reset }
}

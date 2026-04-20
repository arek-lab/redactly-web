import * as pdfjsLib from 'pdfjs-dist'
import type { PageViewport } from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_PAGES = 20

export interface TextItem {
  str: string
  transform: number[]
  width: number
  height: number
  pageIndex: number
}

export interface ExtractResult {
  items: TextItem[]
  fullText: string
  offsetMap: number[]
  pageViewports: PageViewport[]
}

export async function extractTextItems(
  pdfBytes: Uint8Array,
  { onProgress }: { onProgress?: (current: number, total: number) => void } = {}
): Promise<ExtractResult> {
  if (pdfBytes.byteLength > MAX_FILE_SIZE) {
    throw new Error(
      `Plik jest za duży (${(pdfBytes.byteLength / 1024 / 1024).toFixed(1)} MB). Maksymalny rozmiar to 10 MB.`
    )
  }

  let pdf: pdfjsLib.PDFDocumentProxy
  try {
    console.log('pdfBytes slice check:', pdfBytes.slice(0, 5))
    console.log('is ArrayBuffer?', pdfBytes.buffer instanceof ArrayBuffer)
    console.log('byteOffset:', pdfBytes.byteOffset)
    const loadingTask = pdfjsLib.getDocument(
      pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer
    )
    pdf = await loadingTask.promise
  } catch (err) {
    const e = err as { name?: string; message?: string }
    if (e?.name === 'PasswordException') {
      throw new Error('PDF jest zaszyfrowany hasłem. Odblokuj plik przed anonimizacją.')
    }
    throw new Error(`Nie udało się otworzyć pliku PDF: ${e?.message ?? err}`)
  }

  if (pdf.numPages > MAX_PAGES) {
    throw new Error(
      `Dokument ma ${pdf.numPages} stron. Maksymalna liczba stron to ${MAX_PAGES}.`
    )
  }

  const items: TextItem[] = []
  const pageViewports: PageViewport[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    pageViewports.push(page.getViewport({ scale: 1 }))

    const textContent = await page.getTextContent()
    const pageIndex = pageNum - 1

    for (const item of textContent.items) {
      if (!('str' in item) || typeof item.str !== 'string') continue
      items.push({
        str: item.str,
        transform: item.transform,
        width: item.width,
        height: item.height,
        pageIndex,
      })
    }

    if (onProgress) onProgress(pageNum, pdf.numPages)
  }

  if (items.length === 0) {
    return { items: [], fullText: '', offsetMap: [], pageViewports }
  }

  let fullText = ''
  const offsetMap: number[] = []

  for (const [itemIndex, item] of items.entries()) {
    for (let i = 0; i < item.str.length; i++) {
      fullText += item.str[i]
      offsetMap.push(itemIndex)
    }
  }

  // Invariant: fullText.length === offsetMap.length — zawsze
  return { items, fullText, offsetMap, pageViewports }
}

import { PDFDocument, rgb } from 'pdf-lib'
import type { PiiMatch } from './piiDetect'
import type { TextItem } from './pdfExtract'

export async function redactPdf(
  pdfBytes: Uint8Array,
  matches: PiiMatch[],
  items: TextItem[],
  offsetMap: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)

  for (const match of matches) {
    const touchedItemIndices = new Set(offsetMap.slice(match.start, match.end))

    for (const itemIndex of touchedItemIndices) {
      const item = items[itemIndex]
      const page = pdfDoc.getPage(item.pageIndex)

      page.drawRectangle({
        x: item.transform[4] - 2,
        y: item.transform[5] - 2,
        width: item.width + 4,
        height: (item.height ?? item.transform[3]) + 4,
        color: rgb(1, 1, 1),
      })
    }
  }

  return pdfDoc.save()
}

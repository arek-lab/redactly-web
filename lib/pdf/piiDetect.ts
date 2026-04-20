// PII detection via regex (PESEL, Karta płatnicza, IBAN PL)

export type PiiMatch = {
  type: 'PESEL' | 'KARTA' | 'IBAN'
  start: number
  end: number
  value: string
}

export type PiiSummary = { PESEL: number; KARTA: number; IBAN: number }

const PESEL = /(?<!\d)\d{2}[0-3]\d[0-5]\d{6}(?!\d)/g

const KARTA =
  /(?<!\w)(?:\d{4}[ -]?){3}\d{4}(?!\w)|(?<!\w)\d{4}([ -]?)(?:\*{4}\1){1,2}\d{4}(?!\w)|(?<!\w)[\d*]{4}([ -]?)\*{4}\2\*{4}\2[\d*]{4}(?!\w)/g

const IBAN = /\bPL[ -]?\d[\d \t-]{20,37}\d\b/gi

/**
 * Detect PII in fullText and return maskedText + matches.
 * Invariant: maskedText.length === fullText.length — always.
 */
export function detectAndMask(fullText: string): {
  maskedText: string
  matches: PiiMatch[]
} {
  const matches: PiiMatch[] = []

  for (const [pattern, type] of [
    [PESEL, 'PESEL'],
    [KARTA, 'KARTA'],
    [IBAN, 'IBAN'],
  ] as [RegExp, PiiMatch['type']][]) {
    pattern.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = pattern.exec(fullText)) !== null) {
      matches.push({
        type,
        start: m.index,
        end: m.index + m[0].length - 1,
        value: m[0],
      })
    }
  }

  matches.sort((a, b) => a.start - b.start)

  const chars = fullText.split('')
  for (const { start, end } of matches) {
    for (let i = start; i <= end; i++) {
      if (chars[i] !== ' ') {
        chars[i] = '-'
      }
    }
  }

  return { maskedText: chars.join(''), matches }
}

/**
 * Summarize match counts by type.
 */
export function summarize(matches: PiiMatch[]): PiiSummary {
  const counts: PiiSummary = { PESEL: 0, KARTA: 0, IBAN: 0 }
  for (const { type } of matches) {
    if (type in counts) counts[type]++
  }
  return counts
}

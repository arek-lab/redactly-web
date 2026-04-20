import { describe, it, expect } from 'vitest'
import { detectAndMask, summarize } from './piiDetect'

describe('detectAndMask', () => {
  it('returns empty matches and unchanged text when no PII', () => {
    const { maskedText, matches } = detectAndMask('Hello world, no secrets here.')
    expect(matches).toHaveLength(0)
    expect(maskedText).toBe('Hello world, no secrets here.')
  })

  it('maskedText length always equals fullText length', () => {
    const text = 'PESEL: 44051401458 i karta 1234-5678-9012-3456'
    const { maskedText } = detectAndMask(text)
    expect(maskedText.length).toBe(text.length)
  })

  describe('PESEL', () => {
    it('detects a valid PESEL', () => {
      const { matches } = detectAndMask('PESEL: 44051401458')
      expect(matches).toHaveLength(1)
      expect(matches[0].type).toBe('PESEL')
      expect(matches[0].value).toBe('44051401458')
    })

    it('masks PESEL digits with dashes, preserving spaces', () => {
      const { maskedText } = detectAndMask('44051401458')
      expect(maskedText).toBe('-----------')
    })

    it('does not detect 10-digit number (too short)', () => {
      const { matches } = detectAndMask('1234567890')
      expect(matches).toHaveLength(0)
    })

    it('does not detect 12-digit number (too long)', () => {
      const { matches } = detectAndMask('440514014580')
      expect(matches).toHaveLength(0)
    })

    it('does not match when surrounded by digits', () => {
      const { matches } = detectAndMask('0440514014580')
      expect(matches).toHaveLength(0)
    })

    it('detects multiple PESELs', () => {
      const { matches } = detectAndMask('44051401458 i 92071314764')
      const pesels = matches.filter(m => m.type === 'PESEL')
      expect(pesels).toHaveLength(2)
    })
  })

  describe('KARTA (payment card)', () => {
    it('detects 16-digit card without separator', () => {
      const { matches } = detectAndMask('1234567890123456')
      const karta = matches.filter(m => m.type === 'KARTA')
      expect(karta).toHaveLength(1)
      expect(karta[0].value).toBe('1234567890123456')
    })

    it('detects card with dashes', () => {
      const { matches } = detectAndMask('1234-5678-9012-3456')
      const karta = matches.filter(m => m.type === 'KARTA')
      expect(karta).toHaveLength(1)
    })

    it('detects card with spaces', () => {
      const { matches } = detectAndMask('1234 5678 9012 3456')
      const karta = matches.filter(m => m.type === 'KARTA')
      expect(karta).toHaveLength(1)
    })

    it('masks card digits including separators (only spaces preserved)', () => {
      const { maskedText } = detectAndMask('1234-5678-9012-3456')
      expect(maskedText).toBe('-------------------')
    })

    it('detects masked card (asterisks)', () => {
      const { matches } = detectAndMask('1234-****-****-3456')
      const karta = matches.filter(m => m.type === 'KARTA')
      expect(karta).toHaveLength(1)
    })
  })

  describe('IBAN PL', () => {
    it('detects Polish IBAN without spaces', () => {
      const { matches } = detectAndMask('PL61109010140000071219812874')
      const iban = matches.filter(m => m.type === 'IBAN')
      expect(iban).toHaveLength(1)
      expect(iban[0].type).toBe('IBAN')
    })

    it('detects Polish IBAN with spaces', () => {
      const { matches } = detectAndMask('PL 61 1090 1014 0000 0712 1981 2874')
      const iban = matches.filter(m => m.type === 'IBAN')
      expect(iban).toHaveLength(1)
    })

    it('detects PL IBAN case-insensitively', () => {
      const { matches } = detectAndMask('pl61109010140000071219812874')
      const iban = matches.filter(m => m.type === 'IBAN')
      expect(iban).toHaveLength(1)
    })

    it('does not detect non-Polish IBAN', () => {
      const { matches } = detectAndMask('DE89370400440532013000')
      const iban = matches.filter(m => m.type === 'IBAN')
      expect(iban).toHaveLength(0)
    })

    it('masks IBAN digits', () => {
      const { maskedText } = detectAndMask('PL61109010140000071219812874')
      expect(maskedText.length).toBe('PL61109010140000071219812874'.length)
      expect(maskedText).not.toContain('6')
    })
  })

  describe('mixed PII', () => {
    it('detects and sorts matches by start position', () => {
      const text = 'IBAN: PL61109010140000071219812874, PESEL: 44051401458'
      const { matches } = detectAndMask(text)
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i].start).toBeGreaterThanOrEqual(matches[i - 1].start)
      }
    })

    it('match.end is last char index (inclusive)', () => {
      const { matches } = detectAndMask('44051401458')
      expect(matches[0].start).toBe(0)
      expect(matches[0].end).toBe(10)
    })
  })
})

describe('summarize', () => {
  it('returns zeroes for empty matches', () => {
    expect(summarize([])).toEqual({ PESEL: 0, KARTA: 0, IBAN: 0 })
  })

  it('counts each type correctly', () => {
    const { matches } = detectAndMask(
      'PESEL 44051401458, karta 1234567890123456, IBAN PL61109010140000071219812874'
    )
    const summary = summarize(matches)
    expect(summary.PESEL).toBe(1)
    expect(summary.KARTA).toBe(1)
    expect(summary.IBAN).toBe(1)
  })

  it('handles multiple of same type', () => {
    const { matches } = detectAndMask('44051401458 oraz 92071314764')
    expect(summarize(matches).PESEL).toBe(2)
  })
})

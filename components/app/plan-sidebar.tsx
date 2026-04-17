'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Subscription } from '@/types/database'
import { cn } from '@/lib/utils'

interface PlanSidebarProps {
  isLoggedIn: boolean
  isPremium: boolean
  pdfSub: Subscription | null
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-badge-ok">
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-text-faint">
      <path d="M4 7H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ComparisonTable() {
  const rows: [string, boolean, boolean][] = [
    ['PESEL, IBAN, nr karty', true, true],
    ['Imiona i nazwiska', false, true],
    ['Lokalizacje, adresy', false, true],
    ['Kontekstowy model NLP', false, true],
  ]

  return (
    <div className="space-y-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left font-normal text-text-muted pb-3 pr-3">Funkcja</th>
            <th className="text-center font-normal text-text-muted pb-3 px-2 w-14">Free</th>
            <th className="text-center font-medium text-accent pb-3 px-2 w-20">Premium</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, free, premium]) => (
            <tr key={label} className="border-t border-border-soft">
              <td className="py-2.5 pr-3 text-text-secondary">{label}</td>
              <td className="py-2.5 px-2 text-center">
                <span className="flex justify-center">{free ? <CheckIcon /> : <DashIcon />}</span>
              </td>
              <td className="py-2.5 px-2 text-center">
                <span className="flex justify-center">{premium ? <CheckIcon /> : <DashIcon />}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="/register" className="block">
        <Button variant="accent" size="md" className="w-full">
          Zarejestruj się, by odblokować
        </Button>
      </Link>
      <p className="text-center text-text-muted text-xs">
        Masz konto?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Zaloguj się
        </Link>
      </p>
    </div>
  )
}

function LoggedInInfo({
  pdfSub,
}: {
  pdfSub: Subscription | null
}) {
  const tier = pdfSub?.tier ?? 'free'
  const isActive = pdfSub?.status === 'active'
  const quotaTotal = pdfSub?.quota_total ?? null
  const quotaUsed = pdfSub?.quota_used ?? 0

  const TIER_LABELS: Record<string, string> = {
    free: 'Free',
    premium: 'Premium',
    payg: 'Pay as you go',
    sub: 'Subskrypcja',
    enterprise: 'Enterprise',
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide font-semibold mb-1">
          Twój plan
        </p>
        <p className="font-semibold text-text-primary">{TIER_LABELS[tier] ?? tier}</p>
        {isActive && (
          <span className="inline-block mt-1 text-xs font-medium text-badge-ok bg-badge-ok/15 rounded-full px-2 py-0.5">
            Aktywny
          </span>
        )}
      </div>

      {quotaTotal !== null && (
        <div>
          <div className="flex items-center justify-between text-sm text-text-secondary mb-1.5">
            <span>Quota miesięczna</span>
            <span className="text-text-primary font-medium">
              {quotaUsed} / {quotaTotal} str.
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{
                width: `${quotaTotal > 0 ? Math.min(Math.round((quotaUsed / quotaTotal) * 100), 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {tier === 'free' && (
        <Link href="/dashboard" className="block">
          <Button variant="accent" size="md" className="w-full">
            Ulepsz plan
          </Button>
        </Link>
      )}

      <Link
        href="/dashboard"
        className="block text-center text-sm text-accent hover:underline"
      >
        Przejdź do ustawień
      </Link>
    </div>
  )
}

export function PlanSidebar({ isLoggedIn, isPremium, pdfSub }: PlanSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const title = isLoggedIn ? 'Twój plan' : 'Porównanie planów'

  return (
    <div className="rounded-[12px] border border-border-soft bg-bg-white overflow-hidden">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-controls="plan-sidebar-content"
        className="lg:hidden w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-text-primary"
      >
        <span>{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={cn('transition-transform duration-200', mobileOpen && 'rotate-180')}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Divider on mobile when open */}
      <div
        id="plan-sidebar-content"
        className={cn(
          'px-5 pb-5',
          'lg:block lg:pt-5',
          mobileOpen ? 'block border-t border-border-soft pt-4' : 'hidden',
        )}
      >
        {!isLoggedIn ? (
          <ComparisonTable />
        ) : (
          <LoggedInInfo pdfSub={pdfSub} />
        )}
      </div>
    </div>
  )
}

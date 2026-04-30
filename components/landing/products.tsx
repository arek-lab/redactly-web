'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/section-header'

/* ─── Step mocks ─────────────────────────────────────────────────────────── */

function MockSelectText() {
  return (
    <div className="rounded-[8px] border border-border-soft bg-bg-surface p-4 text-[12px] font-mono leading-relaxed">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-badge-found/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-badge-ok/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-mid" />
        <span className="ml-2 flex-1 rounded-[3px] bg-border-soft px-2 py-0.5 text-text-faint">
          chatgpt.com
        </span>
      </div>
      <div className="rounded-[4px] border border-border-input bg-bg-white px-3 py-2.5 text-text-primary">
        <span className="rounded-[2px] bg-accent/20 text-text-primary">
          Anna Kowalska napisała wiadmość do klienta PESEL: 83120110455
        </span>
        <span className="text-text-muted">...</span>
      </div>
    </div>
  )
}

const BADGE_STEPS = [
  { label: 'Sprawdź',    color: '#7C3AED', duration: 1200 },
  { label: 'Sprawdzam…', color: '#7C3AED', duration: 1600 },
  { label: 'Wykryto',    color: '#BD114A', duration: 2000 },
  { label: 'Sprawdź',    color: '#7C3AED', duration: 1200 },
  { label: 'Sprawdzam…', color: '#7C3AED', duration: 1600 },
  { label: 'OK',         color: '#9FCB98', duration: 2000 },
]

function MockBadgeClick() {
  const [stepIdx, setStepIdx] = useState(0)
  const step = BADGE_STEPS[stepIdx]

  useEffect(() => {
    const t = setTimeout(
      () => setStepIdx((i) => (i + 1) % BADGE_STEPS.length),
      step.duration,
    )
    return () => clearTimeout(t)
  }, [stepIdx, step.duration])

  return (
    <div className="rounded-[8px] border border-border-soft bg-bg-surface p-4 text-[12px] font-mono">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-badge-found/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-badge-ok/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-mid" />
        <span className="ml-2 flex-1 rounded-[3px] bg-border-soft px-2 py-0.5 text-text-faint">
          chatgpt.com
        </span>
      </div>
      <div className="relative rounded-[4px] border border-border-input bg-bg-white px-3 py-2.5 text-text-primary">
        <span className="rounded-[2px] bg-accent/20">Anna Kowalska napisała wiadmość do klienta PESEL: 83120110455</span>
        <span className="text-text-muted">...</span>
        <span
          className="absolute -top-9 left-0 inline-flex items-center gap-[5px] rounded-[6px] px-3 py-1.5 text-[13px] font-bold whitespace-nowrap transition-colors duration-200"
          style={{
            background: '#1A1A18',
            border: `1px solid ${step.color}`,
            color: step.color,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-200"
            style={{ background: step.color }}
          />
          {step.label}
        </span>
      </div>
    </div>
  )
}

function MockRedacted() {
  return (
    <div className="rounded-[8px] border border-border-soft bg-bg-surface p-4 text-[12px] font-mono">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-badge-found/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-badge-ok/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-mid" />
        <span className="ml-2 flex-1 rounded-[3px] bg-border-soft px-2 py-0.5 text-text-faint">
          chatgpt.com
        </span>
      </div>
      <div className="rounded-[4px] border border-border-input bg-bg-white px-3 py-2.5 text-text-primary leading-relaxed">
        <span className="text-badge-found tracking-widest">---- --------</span>
        <span className="text-text-primary"> napisała wiadomość do klienta PESEL: </span>
        <span className="text-badge-found tracking-widest">-----------</span>
      </div>
    </div>
  )
}

function MockDropzone() {
  return (
    <div className="rounded-[8px] border-2 border-dashed border-border-mid bg-bg-surface p-4 text-center text-[12px] text-text-muted">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="mx-auto mb-2 text-text-faint"
        aria-hidden="true"
      >
        <rect x="4" y="2" width="16" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 14h10M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-text-muted">Przeciągnij plik PDF</p>
      <p className="mt-0.5 text-text-faint">lub kliknij, by wybrać</p>
    </div>
  )
}

function MockProcessing() {
  return (
    <div className="space-y-2.5 rounded-[8px] border border-border-soft bg-bg-surface p-3 text-[12px]">
      <div className="flex items-center justify-between text-text-secondary">
        <span>umowa.pdf</span>
        <span className="text-accent font-medium">Analiza...</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border-soft overflow-hidden">
        <div className="h-full w-3/4 rounded-full bg-accent" />
      </div>
    </div>
  )
}

function MockDownload() {
  return (
    <div className="rounded-[8px] border border-badge-ok/40 bg-badge-ok/10 p-3 text-[12px]">
      <div className="mb-2.5 flex items-center gap-2 text-text-primary">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="text-badge-ok">
          <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M4 8h6M4 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-text-primary">umowa_anonimowa.pdf</span>
      </div>
      <button className="w-full rounded-[5px] bg-badge-ok/30 py-1 text-text-primary font-medium hover:bg-badge-ok/40 transition-colors">
        Pobierz
      </button>
    </div>
  )
}

/* ─── Pricing cards ──────────────────────────────────────────────────────── */

interface PlanFeature {
  text: string
}

interface Plan {
  name: string
  price: string
  priceNote?: string
  features: PlanFeature[]
  cta: string
  ctaHref: string
  highlighted?: boolean
  ctaVariant?: 'accent' | 'outline'
  comingSoon?: boolean
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-6 py-10',
        plan.highlighted && 'border-accent ring-1 ring-accent/20',
      )}
    >
      {plan.highlighted && (
        <span className="self-start rounded-[4px] bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
          Popularne
        </span>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          {plan.name}
        </p>
        <p className="mt-1 font-display text-[24px] font-bold text-text-primary leading-none">
          {plan.price}
        </p>
        {plan.priceNote && (
          <p className="mt-1 text-[13px] text-text-muted">{plan.priceNote}</p>
        )}
      </div>
      <ul className="flex-1 space-y-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-text-secondary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="mt-0.5 shrink-0 text-accent"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f.text}
          </li>
        ))}
      </ul>
      {plan.comingSoon ? (
        <span className="inline-flex items-center justify-center rounded-[7px] border border-border-mid px-4 py-2 text-[13px] font-medium text-text-muted">
          Wkrótce
        </span>
      ) : (
        <a
          href={plan.ctaHref}
          className={cn(
            'inline-flex items-center justify-center rounded-[7px] px-4 py-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer',
            plan.highlighted || plan.ctaVariant === 'accent'
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'border border-border-mid text-text-primary hover:border-accent hover:text-accent',
          )}
        >
          {plan.cta}
        </a>
      )}
    </Card>
  )
}

/* ─── Tab content ────────────────────────────────────────────────────────── */

const extensionSteps = [
  {
    number: '01',
    title: 'Zaznacz tekst',
    description: 'W dowolnym polu tekstowym w przeglądarce',
    mock: <MockSelectText />,
  },
  {
    number: '02',
    title: 'Kliknij badge',
    description: 'Pojawia się badge "Sprawdź" przy zaznaczeniu',
    mock: <MockBadgeClick />,
  },
  {
    number: '03',
    title: 'Dane zastąpione',
    description: 'Każdy znak zastąpiony myślnikiem 1:1',
    mock: <MockRedacted />,
  },
]

const extensionPlans: Plan[] = [
  {
    name: 'Free',
    price: '0 zł',
    priceNote: 'bez rejestracji',
    features: [
      { text: 'Regex: PESEL, IBAN, nr karty' },
      { text: 'Działa lokalnie w przeglądarce' },
      { text: 'Manifest V3, Shadow DOM' },
    ],
    cta: 'Zainstaluj',
    ctaHref: '#',
  },
  {
    name: 'Premium',
    price: '29,99 zł',
    priceNote: 'miesięcznie',
    features: [
      { text: 'Wszystko z Free' },
      { text: 'Lematyzacja polskich imion' },
      { text: 'Bazy geograficzne' },
      { text: 'Model NLP – detekcja kontekstowa' },
    ],
    cta: 'Kup Premium',
    ctaHref: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'od 19,99 zł',
    priceNote: 'os. / mies.',
    features: [
      { text: 'Wszystko z Premium' },
      { text: 'Konfiguracja reguł i encji' },
      { text: 'DPA, SLA, onboarding' },
    ],
    cta: 'Skontaktuj się',
    ctaHref: 'mailto:kontakt@redactly.app',
    ctaVariant: 'outline',
  },
]

const pdfSteps = [
  {
    number: '01',
    title: 'Przeciągnij plik',
    description: 'Plik PDF trafia do przeglądarki lub backendu',
    mock: <MockDropzone />,
  },
  {
    number: '02',
    title: 'Silnik analizuje',
    description: 'Wykrywa imiona, PESEL, IBAN, adresy',
    mock: <MockProcessing />,
  },
  {
    number: '03',
    title: 'Pobierz wynik',
    description: 'Anonimowy PDF gotowy do udostępnienia',
    mock: <MockDownload />,
  },
]

const pdfPlans: Plan[] = [
  {
    name: 'Free',
    price: '0 zł',
    priceNote: 'bez rejestracji',
    features: [
      { text: 'Lokalny regex w przeglądarce' },
      { text: 'PESEL, IBAN, nr karty' },
      { text: 'TLS 1.3, zero uploadu' },
    ],
    cta: 'Otwórz aplikację',
    ctaHref: '/app',
  },
  {
    name: 'Płać tylko za użycie',
    price: '0,10 zł',
    priceNote: 'za stronę',
    features: [
      { text: 'Pełna anonimizacja (NLP)' },
      { text: 'Backend w eu-central-1' },
      { text: 'Plik usunięty po 60 s' },
    ],
    cta: 'Zacznij',
    ctaHref: '/app',
    ctaVariant: 'accent',
    comingSoon: true,
  },
  {
    name: 'Subskrypcja',
    price: 'od 29,99 zł',
    priceNote: '100 str. / mies.',
    features: [
      { text: 'Starter: 100 str. – 29,99 zł' },
      { text: 'Business: 500 str. – 99,99 zł' },
      { text: 'Pro: 1 500 str. – 249,99 zł' },
    ],
    cta: 'Wybierz plan',
    ctaHref: '/app',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Kontakt',
    features: [
      { text: 'Bez limitu stron' },
      { text: 'Konfiguracja reguł' },
      { text: 'DPA, SLA, dedykowany serwer' },
    ],
    cta: 'Skontaktuj się',
    ctaHref: 'mailto:kontakt@redactly.app',
    ctaVariant: 'outline',
  },
]

/* ─── Steps grid ─────────────────────────────────────────────────────────── */

function StepsGrid({
  steps,
}: {
  steps: { number: string; title: string; description: string; mock: React.ReactNode }[]
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[11px] font-bold text-accent tracking-widest">
              {step.number}
            </span>
            <div className="h-px flex-1 bg-border-soft" />
          </div>
          <div className="px-0.5 h-14">
            <p className="font-medium text-text-primary text-[14px]">{step.title}</p>
            <p className="mt-1 text-[13px] text-text-secondary">{step.description}</p>
          </div>
          <div className="mt-4">{step.mock}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */

type TabId = 'extension' | 'pdf'

export function Products() {
  const [activeTab, setActiveTab] = useState<TabId>('extension')

  return (
    <section id="jak-dziala" className="px-6 py-20 md:py-24 bg-bg-surface">
      <div className="mx-auto max-w-[920px] space-y-10">
        <SectionHeader
          eyebrow="Produkty"
          title="Dwa sposoby ochrony danych"
          description="Wtyczka chroni tekst w przeglądarce. Aplikacja PDF anonimizuje dokumenty przed wysłaniem."
        />

        {/* Tab switcher */}
        <div
          className="inline-flex rounded-[8px] border border-border-soft bg-bg-white p-1 gap-1"
          role="tablist"
          aria-label="Wybór produktu"
        >
          {(
            [
              { id: 'extension', label: 'Wtyczka Chrome' },
              { id: 'pdf', label: 'Pliki PDF' },
            ] as { id: TabId; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-[6px] px-5 py-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer',
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Extension tab */}
        <div
          id="tabpanel-extension"
          role="tabpanel"
          aria-labelledby="tab-extension"
          hidden={activeTab !== 'extension'}
          className="space-y-10"
        >
          <div>
            <p className="text-text-secondary max-w-[600px]">
              Redactly Extension wykrywa dane osobowe w polach tekstowych bezpośrednio w
              przeglądarce – zanim trafią do ChatGPT, Gemini, Copilota lub dowolnego
              innego narzędzia. Działa na każdej stronie, w Shadow DOM.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              Jak działa
            </p>
            <StepsGrid steps={extensionSteps} />
          </div>

        </div>

        {/* PDF tab */}
        <div
          id="tabpanel-pdf"
          role="tabpanel"
          aria-labelledby="tab-pdf"
          hidden={activeTab !== 'pdf'}
          className="space-y-10"
        >
          <div>
            <p className="text-text-secondary max-w-[600px]">
              Redactly Files przetwarza dokumenty PDF i zwraca zanonimizowaną wersję
              gotową do udostępnienia. Plan free działa lokalnie w przeglądarce – bez
              uploadu, bez rejestracji.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              Jak działa
            </p>
            <StepsGrid steps={pdfSteps} />
          </div>
        </div>

        {/* Pricing — always in DOM so /#cennik anchor works */}
        <div id="cennik" className="scroll-mt-20">
          <p className="mb-5 text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted">
            Plany
          </p>
          {activeTab === 'extension' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {extensionPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pdfPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

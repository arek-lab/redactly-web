import { SectionHeader } from '@/components/ui/section-header'

interface EngineBlock {
  title: string
  description: string
  icon: React.ReactNode
}

function IconPattern() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
      <path
        d="M4 7h4M4 12h4M4 17h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="10" y="5" width="10" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="15" width="8" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconLemma() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
      <path
        d="M4 6h5l2 12M9 6l2 12M11 18h3M13 6h4l-4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6h3M17 18h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19.5 6v12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </svg>
  )
}

function IconGeo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3C8.134 3 5 6.134 5 10c0 5.25 7 11 7 11s7-5.75 7-11c0-3.866-3.134-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function IconNLP() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 7l4.5 4M18 7l-4.5 4M6 17l4.5-4M18 17l-4.5-4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const blocks: EngineBlock[] = [
  {
    title: 'Wzorce i reguły',
    description:
      'PESEL, IBAN, numery kart płatniczych, adresy email, numery telefonów. Deterministyczne reguły regex — szybkie i pewne dla ustrukturyzowanych danych.',
    icon: <IconPattern />,
  },
  {
    title: 'Bazy geograficzne i lematyzacja',
    description:
      'Porównujemy tekst z bazami polskich miejscowości, ulic i regionów. Lematyzacja pozwala wykryć nazwy odmienione lub będące wyrazami pospolitymi — np. "ul. Lipowej" czy "Zielonej Górze".',
    icon: <IconGeo />,
  },
  {
    title: 'Model językowy NLP',
    description:
      'Nowoczesny model rozumie kontekst zdania. "Przelej Janowi 500 zł" — wykrywa "Janowi" jako imię, mimo odmiany przez przypadek.',
    icon: <IconNLP />,
  },
]

export function Engine() {
  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-[920px] space-y-10">
        <SectionHeader
          eyebrow="Technologia"
          title="Jak naprawdę działa anonimizacja"
          description="Nie tylko PESEL i IBAN. Każde imię, każdy adres, każdy kontekst."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {blocks.map((block) => (
            <div
              key={block.title}
              className="bg-bg-white rounded-[12px] border border-border-soft p-6 space-y-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-accent/10">
                {block.icon}
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-[15px] text-text-primary">
                  {block.title}
                </h4>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {block.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

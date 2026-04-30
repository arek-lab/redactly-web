import Link from 'next/link'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Badge } from '@/components/ui/badge'

const pillTags = ['RODO', 'PESEL', 'IBAN', 'NLP', 'Shadow DOM']

export function Hero() {
  return (
    <section className="px-6 pt-[5px] pb-24 md:pt-28 md:pb-32">
      <div className="mx-auto max-w-[920px]">
        <div className="max-w-[680px] space-y-7 animate-fade-up">
          <Eyebrow>Anonimizacja danych osobowych</Eyebrow>

          <h1 className="font-display text-text-primary text-[32px]! md:text-[48px]! tracking-[0.01em]! text-balance">
            Anonimizacja danych osobowych chroni podczas pracy z AI.
          </h1>

          <p className="text-text-secondary text-[17px] leading-relaxed max-w-[560px]">
            Redactly wykrywa i anonimizuje dane osobowe automatycznie – zanim
            tekst opuści przeglądarkę lub plik trafi do zewnętrznego systemu.
            Działa bez konfiguracji, lokalnie lub w centrum danych w UE.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 animate-fade-up animation-delay-100">
            <Link
              href="#"
              className="inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[7px] cursor-pointer select-none h-12 px-7 text-base bg-accent text-white hover:bg-accent-hover"
            >
              Zainstaluj wtyczkę Chrome
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[7px] cursor-pointer select-none h-12 px-7 text-base bg-transparent border border-border-mid text-text-primary hover:border-accent hover:text-accent"
            >
              Anonimizuj plik PDF →
            </Link>
          </div>

          {/* RODO badge */}
          <div className="flex items-center gap-2 animate-fade-up animation-delay-200">
            <span
              className="inline-block w-2 h-2 rounded-full bg-accent shrink-0"
              aria-hidden="true"
            />
            <span className="text-[13px] text-text-secondary">
              Dane przetwarzane zgodnie z RODO · W przeglądarce lub w UE
            </span>
          </div>

          {/* Pill badges */}
          <div className="flex flex-wrap gap-2 animate-fade-up animation-delay-300">
            {pillTags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

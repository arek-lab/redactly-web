import Link from 'next/link'

function LogoMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="text-accent shrink-0"
    >
      <rect width="28" height="28" rx="7" fill="currentColor" />
      <path d="M8 9h7c2.21 0 4 1.79 4 4s-1.79 4-4 4H8V9z" fill="white" />
      <path
        d="M8 17h5l4 4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const footerLinks = [
  { href: '/privacy', label: 'Prywatność' },
  { href: '/dpa', label: 'DPA' },
  { href: '/docs', label: 'Dokumentacja' },
  { href: 'mailto:kontakt@redactly.app', label: 'Kontakt' },
]

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-bg-white">
      <div className="mx-auto max-w-[920px] px-6 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo + copyright */}
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[13px] text-text-secondary">
            &copy; 2026 Redactly &middot; Dane przetwarzane zgodnie z RODO na terenie UE
          </span>
        </div>

        {/* Links */}
        <nav aria-label="Linki stopki">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-text-muted hover:text-text-primary transition-colors duration-150"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}

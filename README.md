# Redactly — Web App

Landing page + aplikacja PDF + dashboard dla platformy anonimizacji danych osobowych.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Stripe

---

## Setup

### 1. Zmienne środowiskowe

```bash
cp .env.example .env.local
```

Uzupełnij wartości w `.env.local`:

| Zmienna | Opis |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Publiczny adres aplikacji (np. `https://redactly.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klucz anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Klucz service_role (tylko serwer) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Klucz publiczny Stripe |
| `STRIPE_SECRET_KEY` | Klucz sekretny Stripe (tylko serwer) |
| `STRIPE_WEBHOOK_SECRET` | Sekret webhooka Stripe |
| `STRIPE_PRICE_*` | ID cenników Stripe (z dashboardu Stripe) |

### 2. Instalacja zależności

```bash
npm install
```

### 3. Migracje Supabase

Wykonaj migracje w panelu Supabase SQL Editor lub przez CLI:

```bash
supabase db push
```

Wymagane pliki migracji (w kolejności):
- `supabase/migrations/003_add_stripe.sql`
- `supabase/migrations/004_fix_status_default.sql`

### 4. Uruchomienie

```bash
npm run dev
```

Aplikacja dostępna pod adresem [http://localhost:3000](http://localhost:3000).

---

## Struktura

```
app/
├── (landing)/page.tsx          # Landing page /
├── (app)/app/page.tsx          # PDF anonymizer /app
├── (app)/dashboard/page.tsx    # Konto użytkownika /dashboard
├── (auth)/login/page.tsx       # Logowanie
├── (auth)/register/page.tsx    # Rejestracja
└── api/
    ├── auth/route.ts
    └── stripe/
        ├── create-checkout/route.ts
        ├── portal/route.ts
        └── webhooks/stripe/route.ts
components/
├── landing/   # Navbar, Hero, Products, Engine, Security, Footer
├── app/       # UploadZone, PlanSidebar, SubscriptionCards, Dashboard
└── ui/        # Button, Badge, Card, Eyebrow, SectionHeader
lib/
├── supabase/  # client.ts, server.ts, service.ts
├── stripe.ts
└── anonymizer/
```

---

## Build

```bash
npm run build
```

---

## Linty i typy

```bash
npm run lint
npx tsc --noEmit
```

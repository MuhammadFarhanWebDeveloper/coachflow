# CoachFlow

**Weekly check-ins for fitness coaches.** CoachFlow is a SaaS platform that helps online fitness coaches collect weekly check-ins, track client progress, and manage their coaching business in one place.

## The Problem

Fitness coaches spend too much time chasing clients for updates on WhatsApp and DMs, manually tracking progress across spreadsheets, and trying to spot trends in scattered data. There's no simple, dedicated tool for the weekly check-in workflow that every coach already runs. Client data lives in messages, notes apps, and Google Sheets — never in one place.

## What CoachFlow Solves

CoachFlow replaces the spreadsheet-and-DM chaos with a streamlined system:

- **Link-based check-ins** — Each client gets a unique token link. No app install, no account creation. They open it, fill out the form, and submit. The coach gets the data instantly.
- **Progress tracking** — Weight, mood, energy, workout completion, nutrition adherence, and body measurements (waist, chest, arms) tracked over time with visual charts.
- **Coach feedback** — Coaches can leave inline feedback on any check-in. Clients see it all in one place with their history.
- **Reminders** — Overdue clients (no check-in in 7+ days) appear in a widget with a one-click remind button. A 24-hour cooldown prevents spam.
- **Analytics** — Compliance trends, average metrics across time ranges, client comparison table with trend indicators, goal completion progress bars.

## Features

- **Coach Dashboard** — 4 metric cards (total clients, pending check-ins, completed this week, average compliance), weekly check-in rate line chart, client compliance bar chart, recent activity feed, pending check-ins widget with remind button.
- **Client Management** — List with status filters (All/Active/Paused/Inactive), search, inline status badges, slide-out sheet with client summary, pagination (20 per page).
- **Client Profiles** — 4-tab layout (Overview, Progress, Check-ins, Notes). Weight progress chart, body measurements, check-in history, coach feedback system, shareable check-in link generator.
- **Check-in Management** — Card-based list across all clients, inline coach feedback textarea, pagination.
- **No-Auth Check-in Form** — Public route at `/check-in/[token]`. Mood buttons with emojis, energy slider (1–10), workout/nutrition sliders (0–100%), weight input, body measurements, notes textarea, success confirmation screen.
- **Progress Analytics** — Summary stat cards, time-range filter (All/3mo/6mo/1y), compliance trend line chart, average metrics multi-line chart (energy/workout/nutrition), client growth area chart, goal completion progress bars, sortable client comparison table with trend indicators.
- **Coach Reminders** — 24h cooldown on remind button, overdue detection (7+ days), last reminded date display.
- **Error & Empty States** — Error boundaries on all pages with retry buttons, empty state component with icons and CTAs.
- **Responsive Design** — Mobile sidebar, collapsible panels, responsive charts.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| Auth | Clerk (email/password + social login) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Icons | Lucide React |
| Linting | ESLint 9 with `next/core-web-vitals` + TypeScript |
| Package Manager | pnpm |

## Architecture

The app follows the Next.js App Router pattern with a clear separation of concerns:

- **Route groups** — `(auth)` for sign-in/sign-up pages, `(dashboard)` for protected coach pages.
- **Server components** — Page-level components fetch data via Prisma queries and pass serialized data to client components.
- **Client components** — Handle interactivity: forms, dialogs, sheets, charts, pagination.
- **Server actions** — Located in `lib/actions.ts`, handle mutations (add client, submit feedback, submit check-in, send reminder).
- **Middleware** — Clerk middleware (`proxy.ts`) protects `/dashboard(.*)` routes and exposes public routes for webhooks and check-in links.

### Data Flow

```
Clerk Auth → Middleware (proxy.ts) → Server Component (page.tsx)
  → lib/queries.ts (Prisma DB queries)
  → Client Component (interactive UI)
  → lib/actions.ts (server actions for mutations)
  → revalidatePath / router.refresh()
```

### Database Schema

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `id`, `clerkId` (unique), `name`, `email`, `avatar` | Synced via Clerk webhook |
| **Client** | `id`, `coachId`, `name`, `goal`, `currentWeight`, `goalWeight`, `compliance`, `token` (unique), `status` (enum) | `token` used for no-auth check-in links |
| **CheckIn** | `id`, `clientId`, `week`, `date`, `weight`, `energy`, `mood`, `workoutCompletion`, `nutritionAdherence`, `waist`, `chest`, `arms`, `notes`, `coachFeedback` | One per client per week |
| **Feedback** | `id`, `clientId`, `coachId`, `content` | Coach notes on client progress |

Enums: `ClientStatus` (active, inactive, paused), `Mood` (happy, neutral, tired, stressed, motivated).

## Project Structure

```
app/                    — Next.js App Router pages and API routes
  (auth)/               — Sign-in, sign-up pages
  (dashboard)/          — Protected dashboard, clients, check-ins, progress pages
  api/webhooks/clerk/   — Clerk webhook handler (user sync)
  check-in/[token]/     — Public client check-in form
components/             — Shared UI components
  ui/                   — shadcn/ui primitives (button, card, dialog, sheet, etc.)
  app-sidebar.tsx       — Dashboard sidebar navigation
  add-client-dialog.tsx — Add client modal
  chart-container.tsx   — Responsive chart wrapper
  empty-state.tsx       — Reusable empty state
  pagination.tsx        — Page navigation
  pending-checkins-widget.tsx — Overdue clients with remind button
lib/                    — Core business logic
  prisma.ts             — Prisma client singleton (Neon adapter)
  queries.ts            — Database query functions
  actions.ts            — Server actions (addClient, addFeedback, submitCheckIn, etc.)
  utils.ts              — cn() utility (clsx + tailwind-merge)
hooks/                  — Custom React hooks
  use-mobile.ts         — Mobile breakpoint detection
types/                  — TypeScript interfaces and enums
prisma/                 — Schema, migrations, seed script
  schema.prisma         — Database schema
  seed.ts               — Sample data seeder
  migrations/           — SQL migration files
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon or local)
- Clerk account for authentication

Copy `.env.example` to `.env` and fill in the required environment variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection string |

### Database

```bash
pnpm prisma:migrate
pnpm db:seed
```

## Deploy on Vercel

The project is ready for Vercel deployment. Vercel auto-detects Next.js and uses the default build command (`next build`). Prisma client generation is handled automatically during the build.

### Required environment variables

Set these in your Vercel project dashboard:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `DATABASE_URL` — Neon pooled connection string
- `DIRECT_URL` — Neon direct connection string

### Build settings (Vercel defaults)

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build command | `prisma generate && next build` |
| Output directory | `.next` |
| Install command | `pnpm install` |

> **Note:** Run `prisma migrate deploy` as a one-time command after deployment (or via a Vercel Post-Deploy hook) to apply any pending migrations to your production database.

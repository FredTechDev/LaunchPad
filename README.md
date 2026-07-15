# LaunchPad — MVP
A Next.js app to create micro-experiments, measure visitor behavior with Novus.ai, and track analytics with a built-in dashboard.

## Features

- **Experiment Creation** — Build single-page experiments with hypothesis, CTA, and preview
- **Analytics Dashboard** — Views, clicks, signups, conversion rates with timeline charts
- **Experiment Management** — Edit, pause/activate, delete experiments
- **Server-Side Tracking** — Events stored in Supabase for reliable analytics
- **External Analytics** — Novus.ai and Pendo integration for additional tracking
- **Email Capture** — Collect signups with email validation and duplicate prevention
- **Mobile Responsive** — Works on all device sizes
- **Social Sharing** — Open Graph meta tags for link previews

## Quick Start (Local)

1. Create a Supabase project and run the SQL in `supabase-schema.sql`
2. Create a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NOVUS_PROJECT_KEY=<YOUR_NOVUS_PROJECT_KEY>
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | List all experiments with metrics |
| POST | `/api/experiments` | Create a new experiment |
| GET | `/api/experiments/:id` | Get experiment by ID |
| PUT | `/api/experiments/:id` | Update experiment |
| DELETE | `/api/experiments/:id` | Delete experiment |
| POST | `/api/events` | Track an event (view, cta_click, signup) |
| POST | `/api/submissions` | Submit email for email capture experiments |
| GET | `/api/analytics/:id` | Get analytics for an experiment |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — list all experiments with metrics |
| `/create` | Create new experiment with live preview |
| `/dashboard/:id` | Experiment analytics detail page |
| `/edit/:id` | Edit experiment settings |
| `/experiments/:slug` | Public experiment page (visitor-facing) |

## Database Schema

- **experiments** — Experiment definitions (title, hypothesis, CTA, slug, status)
- **events** — Server-side event tracking (views, clicks, signups)
- **submissions** — Email captures (with unique constraint per experiment)

## Deploy

1. Connect repo to Vercel
2. Add environment variables in Vercel
3. Deploy, then set `NEXT_PUBLIC_APP_URL` to production URL

## Novus Integration

- Novus SDK loads automatically on experiment pages
- Events tracked: `experiment_view`, `experiment_cta_clicked`, `experiment_signed_up`
- Verify the Novus global variable name and update `trackNovus()` in `pages/experiments/[slug].js` if needed

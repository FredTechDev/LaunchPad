# LaunchPad — MVP
A tiny Next.js app to create micro-experiments and measure visitor behavior with Novus.ai.

Quick start (local)
1. Create a Supabase project and run the SQL in supabase-schema.sql.
2. Create a .env.local with:
   NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NOVUS_PROJECT_KEY=<YOUR_NOVUS_PROJECT_KEY>
3. Install and run:
   npm install
   npm run dev
4. Open http://localhost:3000 and click "Create Experiment".

Deploy
- Connect this repo to Vercel. Add the same environment variables in Vercel.
- Deploy, then use the production URL as NEXT_PUBLIC_APP_URL.

Novus
- Replace NOVUS_PROJECT_KEY with your Novus key.
- The public experiment page includes a small helper that calls window.novus.track or window.Novus.track. Confirm the exact global exposed by the Novus snippet and update the helper if needed.
- Required Novus events used by the app:
  - experiment_view
  - experiment_cta_clicked
  - experiment_signed_up

Supabase schema
See supabase-schema.sql for the minimal table definitions.

Notes & next steps
- I can: (A) wire this to a Supabase instance (I’ll need your keys), (B) deploy to Vercel, (C) drive test events (so Novus shows activity), and (D) capture the Novus dashboard screenshot for submission. Tell me which to do next.

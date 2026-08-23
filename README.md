# GDMA Student Work Showcase

Coventry GDMA's student work showcase — an experimental gallery of approved student
design work, with an open submission form and a staff moderation queue.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` (already done in this repo) and fill in
   the secret values:
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings → API → service_role key
   - `ADMIN_PASSWORD` — any password you choose for staff to log into `/admin`
   - `SESSION_SECRET` — a random string (e.g. `openssl rand -hex 32`)
3. Run the schema migration once in the Supabase SQL editor:
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
   creates the `submissions` table and the public `artwork` storage bucket.
4. `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Structure

- `/` — public showcase homepage
- `/submit` — student submission form
- `/admin` — staff moderation queue (password protected)
- `supabase/migrations/` — SQL to run against the Supabase project

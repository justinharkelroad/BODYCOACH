# Standard Nutrition — Handoff Document
**Date:** 2026-04-11
**Status:** Mid-reframe, builds clean, dev server functional

---

## What This App Is

A **coach-led fitness client management platform** (rebranded from "BodyGlow AI" to "Standard Nutrition"). Coach Corina (corinahark@gmail.com) manages clients — sets their macro plans, takes notes, views their progress photos/weight/check-ins, and sends weekly check-in emails.

**Tech Stack:** Next.js 16 (App Router) + Supabase + Tailwind CSS 4 + TypeScript + Resend (email) + Twilio (SMS)

---

## What Was Done This Session

### 1. Production Readiness Fixes
- **Rate limiting** — Replaced broken in-memory rate limiter with Upstash Redis (`@upstash/ratelimit`). Falls back to in-memory for local dev. Needs `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars in production.
- **404 page** — `src/app/not-found.tsx` (themed, branded)
- **Loading skeletons** — Added `loading.tsx` for: root, app shell, dashboard, workouts, stats, nutrition, photos, check-in, admin, admin client detail
- **Global error page** — Polished with theme colors and branding
- **Middleware optimization** — Onboarding check uses cookie cache instead of DB query on every request
- **SEO** — Added `robots.ts`, `sitemap.ts`, Open Graph/Twitter meta tags
- **Accessibility** — aria-labels on sidebar, buttons, inputs; aria-current on nav links; aria-invalid on form errors

### 2. Coach Admin Dashboard (NEW)
**Route group:** `src/app/(admin)/` with its own layout and sidebar

- **Client list** (`/admin`) — Grid of client cards showing name, goal, weight, photo count, last activity. Archived section at bottom with reactivate buttons.
- **Client detail** (`/admin/clients/[clientId]`) — Full client view with:
  - Quick stats (weight, change, photos, check-ins)
  - **Macro plan form** — coach sets calories/protein/carbs/fat (saved to `client_macro_plans` table)
  - **Coach notes** — add/edit/delete notes (saved to `coach_notes` table)
  - Weight chart (reuses `WeightChart` component)
  - Recent weight entries with notes
  - Progress photos grid with filter tabs (read-only, no AI analysis)
  - Check-in history showing sleep hours, water oz, stress emoji, notes
- **Settings** (`/admin/settings`) — Account info, client count, "Send Weekly Check-in Email" button
- **Archive/Reactivate** — coaches can archive clients and reactivate them

### 3. Auth & Roles
- `profiles.role` column: `'client'` (default) or `'coach'`
- Corina's account set to `'coach'` by email match in migration
- Auto-assign trigger: every new signup becomes Corina's client automatically
- Middleware: `/admin` routes protected — non-coaches redirect to `/dashboard`
- Auth callback redirects coaches to `/admin` after login
- Onboarding/welcome checks skipped for `/admin` routes

### 4. App Simplification (Reframe)
**Hidden features (code preserved, removed from UI):**
- AI Coach (`/coach`) — removed from sidebar nav
- Nutrition tracking (`/nutrition`) — removed from sidebar nav
- Weekly Insights — removed from dashboard
- Adaptive Nutrition section — removed from dashboard, replaced with coach-assigned macro display
- AI Workout generation card — removed from dashboard
- "Ask Coach" button — removed from dashboard
- Photo AI analysis — removed Analyze button from photo timeline, removed AI text from empty state

**Check-in page redesigned:**
- **Sleep hours** — toggle buttons (3–12 hours), stored as `daily_checkins.sleep_hours`
- **Water intake** — number input in ounces, stored as `daily_checkins.water_oz`
- **Stress level** — 5 emoji faces (😫😟😐🙂😄), stored as `daily_checkins.stress_level`
- Old mood/energy/sleep quality fields kept in DB but removed from UI
- Weight + notes still work as before

**Client dashboard macro display:**
- "Your Nutrition Plan" card shows coach-assigned macros (calories, protein, carbs, fat)
- Read-only — only the coach can set/update via admin

### 5. Weekly Check-in Email
- Email template in `src/lib/notifications/email.ts` (`weeklyCheckinFormEmail`)
- Links to: `https://form.jotform.com/242795367780168`
- API route: `POST /api/admin/send-checkin-email` — sends to all active clients
- Admin settings page has "Send Now" button with confirmation and result display

### 6. Rebrand
- All metadata: "BodyGlow AI" → "Standard Nutrition"
- manifest.json, Open Graph, Twitter cards, layout title template
- Email from address: "Standard Nutrition"
- robots.ts/sitemap.ts base URL: standardnutrition.com
- Sidebar logo alt text updated
- **Logo images are still placeholders** — user will provide new logos

---

## Database Migrations Pushed (all applied to remote Supabase)

1. `20260411220000_coach_dashboard.sql` — role column, coach_clients table, auto-assign trigger, RLS for coach data access
2. `20260411230000_fix_coach_archived_access.sql` — Fix RLS so coach can see archived client profiles
3. `20260412000000_app_simplification.sql` — sleep_hours/water_oz/stress_level on daily_checkins, coach_notes table, client_macro_plans table, coach_settings jsonb on profiles

---

## Key Files Map

### Admin
- `src/app/(admin)/layout.tsx` — admin layout
- `src/app/(admin)/admin/page.tsx` — client list
- `src/app/(admin)/admin/clients/[clientId]/page.tsx` — client detail (main coach screen)
- `src/app/(admin)/admin/clients/[clientId]/photo-grid.tsx` — photo filter grid
- `src/app/(admin)/admin/settings/page.tsx` — admin settings + email send
- `src/app/(admin)/admin/settings/send-checkin-email.tsx` — send email button component
- `src/components/layout/admin-sidebar.tsx` — admin navigation
- `src/components/admin/client-card.tsx` — client list card
- `src/components/admin/archive-button.tsx` — archive/reactivate
- `src/components/admin/archived-client-row.tsx` — archived client row with reactivate
- `src/components/admin/coach-notes-section.tsx` — CRUD notes UI
- `src/components/admin/macro-plan-form.tsx` — set client macros

### API Routes (Admin)
- `src/app/api/admin/clients/[clientId]/route.ts` — PATCH to archive/reactivate
- `src/app/api/admin/clients/[clientId]/notes/route.ts` — CRUD coach notes
- `src/app/api/admin/clients/[clientId]/macros/route.ts` — GET/PUT macro plans
- `src/app/api/admin/send-checkin-email/route.ts` — send weekly email to all clients

### Client App (Modified)
- `src/components/layout/sidebar.tsx` — nav items (Nutrition & AI Coach removed)
- `src/app/(app)/dashboard/page.tsx` — simplified, macro plan display added
- `src/app/(app)/check-in/page.tsx` — redesigned with new fields
- `src/app/(app)/check-in/check-in-form.tsx` — sleep/water/stress inputs
- `src/app/(app)/photos/photo-timeline.tsx` — AI analyze removed
- `src/app/(app)/photos/page.tsx` — AI text removed

### Infrastructure
- `src/lib/rateLimit.ts` — Upstash Redis rate limiting
- `src/lib/notifications/email.ts` — rebranded, new weeklyCheckinFormEmail template
- `src/middleware.ts` — /admin protection, coach role check, cookie caching
- `src/types/database.ts` — CoachNote, ClientMacroPlan, StressLevel, updated DailyCheckin

---

## What Still Needs To Be Done

### Immediate
- [ ] **New logo** — user will provide Standard Nutrition logo files. Replace images in `public/logos/`
- [ ] **UI/Design overhaul** — user mentioned revamping UI after functional changes
- [ ] **Landing page** — still has BodyGlow AI copy/branding at `src/app/page.tsx`
- [ ] **Onboarding flow** — another session is building a post-onboarding welcome walkthrough
- [ ] **Test the full flow** — sign up as client, check in, upload photo, verify coach sees everything

### Production Deployment
- [ ] Set up Vercel project and deploy
- [ ] Configure env vars in Vercel (Supabase, Anthropic, Upstash Redis, Resend, Sentry)
- [ ] Set up custom domain (standardnutrition.com)
- [ ] Configure Resend domain for email deliverability
- [ ] Set up Upstash Redis (free tier) for rate limiting

### Future Features
- [ ] Automated weekly email sends (Supabase cron instead of manual "Send Now")
- [ ] Push notifications
- [ ] Profile settings edit (currently disabled/stub)
- [ ] Multiple coaches support (currently single-coach model)
- [ ] Invite link flow (built in plan but not implemented — currently auto-assign only)

---

## Env Vars Required

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (still used by workout generation)
ANTHROPIC_API_KEY=

# Rate Limiting (required for production)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# App
NEXT_PUBLIC_APP_URL=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

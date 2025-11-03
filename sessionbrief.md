🧭 Session Brief: Ældern Debt — Auth0 + Supabase (DB-only) Integration
Context (read this first)

We have two Next.js apps hosted on Netlify:

Main site: elderntomes-app (already using Auth0)

Tool: eldern-debts (this repo)

Goal: Keep Auth0 as the single sign-in across the ecosystem. Use Supabase only as Postgres for the Debt tool’s data. No Supabase Auth. No client-side DB keys.

Debt tool lives at its own subdomain: https://debt.elderntomes.com.

Architecture rules

Auth: @auth0/nextjs-auth0. Session lives in cookies. Read user.sub server-side.

DB: Supabase Postgres via service role key from server code only. Never import the DB client in client components.

Scope: Every query must be filtered by user_id = session.user.sub. No RLS required because only server hits DB.

Hosting: Netlify for both apps. This app runs locally on http://localhost:3001
.

Environment variables (use these exact names)
# Auth0
AUTH0_DOMAIN=YOUR_TENANT.us.auth0.com
AUTH0_CLIENT_ID=xxxx
AUTH0_CLIENT_SECRET=xxxx
AUTH0_SECRET=<32+ char random>
APP_BASE_URL=http://localhost:3001   # later: https://debt.elderntomes.com

# Supabase (DB only)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=...             # service role; server-only


Auth0 dashboard must include these URLs:

Allowed Callback: http://localhost:3001/api/auth/callback, https://debt.elderntomes.com/api/auth/callback

Allowed Logout: http://localhost:3001, https://debt.elderntomes.com

Allowed Web Origins: both of the above hosts

Database (already created in Supabase)

Tables: debts, payments, preferences with user_id text (Auth0 user.sub).

Tasks (do these in order)
0) Sanity setup

Create .env.local with the vars above.

Run dev on port 3001.

1) Wire Supabase server client

Install: npm i @supabase/supabase-js

/lib/db.ts

Create a server-only client with SUPABASE_URL + SUPABASE_SERVICE_KEY.

Export db. Never import this in client components.

2) Add Auth0 to this app

Install: npm i @auth0/nextjs-auth0

Create routes under App Router:

/app/api/auth/[...auth0]/route.ts using SDK handlers.

Protect the tool route:

Add middleware.ts using withMiddlewareAuthRequired, with matcher ['/tools/debt/:path*','/debt/:path*'] depending on our folder.

In server components and API routes, read session via:

import { getSession } from '@auth0/nextjs-auth0';
const session = await getSession();
if (!session?.user) return unauthorized;
const userId = session.user.sub;

3) Server API: user-scoped endpoints

Create API routes; all use getSession() and scope by userId.

/app/api/debts/route.ts

GET: return all debts where user_id = userId ordered by due day

POST: validate body, insert with user_id = userId

/app/api/payments/route.ts

POST: insert payment with user_id = userId, then update the related debt’s current_balance and paid_this_cycle

/app/api/preferences/route.ts

GET: fetch by user_id

POST|PUT: upsert for user_id

Validation: clamp due day 1–31, amounts ≥ 0. Return 400 on bad input.

4) Client integration shims (keep the UI working)

Replace existing localStorage store calls with fetch to the new API endpoints.

Keep the same function names: getDebts(), saveDebts(), etc., but now they call /api/....

On first page load:

If no preferences exist for userId, create defaults and show onboarding.

5) Health and auth checks

/app/api/db/health/route.ts should return { ok: true } by counting debts (head).

Add /signin and /signout links using the Auth0 routes:

/api/auth/login, /api/auth/logout

6) Local test plan

Start app on http://localhost:3001

Click “Sign in” → Auth0 → back to app

Hit /api/db/health in browser → { ok: true }

Add a debt via UI → verify row appears in Supabase with your user_id

Log a payment → verify payments row + debt balance change

7) Netlify deploy notes (don’t do until local is green)

Build command: npm run build

Publish dir: .next

Add the exact env vars to Netlify site.

Set custom domain: debt.elderntomes.com

Acceptance criteria

Unauthed users are redirected to Auth0 login for any /tools/debt route.

All DB reads/writes happen server-side and are scoped to user_id = session.user.sub.

No client bundle includes SUPABASE_SERVICE_KEY.

Creating a debt and logging a payment works end-to-end locally on port 3001.

Health route returns { ok: true }.

Constraints

Do not add Supabase Auth.

Do not access Supabase directly from client components.

Keep existing UI and component structure intact.

Output format

Brief summary of what you’ll change

File diff list with paths

Final code for each new/updated file
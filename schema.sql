-- USERS are from Auth0; we store their Auth0 user id (user.sub) as text

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,  -- Auth0 user.sub
  name text not null,
  current_balance numeric(12,2) not null default 0,
  monthly_payment numeric(12,2) not null default 0,
  due_day_of_month int not null check (due_day_of_month between 1 and 31),
  apr numeric(6,4) default 0,
  autopay boolean not null default false,
  notes text,
  active boolean not null default true,
  paid_this_cycle numeric(12,2) not null default 0,
  inserted_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,           -- Auth0 user.sub (mirror for quick scoping)
  debt_id uuid not null references debts(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_on date not null default current_date,
  count_toward_cycle boolean not null default true,
  note text
);

create table if not exists preferences (
  user_id text primary key,        -- Auth0 user.sub
  week_start text not null default 'mon',               -- 'mon' | 'sun'
  currency text not null default 'USD',
  theme text not null default 'dark',
  show_next_month_preview boolean not null default false,
  strategy text not null default 'hybrid',              -- snowball|avalanche|hybrid
  extra_cash numeric(12,2) not null default 0
);

/*Why no RLS here? Because we’ll call Supabase only from your server code (Next.js API route), using the service role key and scoping all queries to user_id = auth0UserSub. That keeps the client blind to DB creds and stays simple.*/
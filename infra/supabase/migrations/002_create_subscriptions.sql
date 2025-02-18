CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,  -- references auth.users or profiles.id
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,   -- e.g., 'active', 'canceled'
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: 'auth.users' table is managed by Supabase Auth.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  subscription_plan_id INTEGER REFERENCES subscription_plans(id),  -- current plan (if you want to cache it)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

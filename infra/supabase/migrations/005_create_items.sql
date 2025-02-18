CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_group_id UUID NOT NULL REFERENCES inventory_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC,
  price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

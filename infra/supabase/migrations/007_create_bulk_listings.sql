CREATE TABLE bulk_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  inventory_group_id UUID REFERENCES inventory_groups(id),
  listing_count INTEGER NOT NULL,
  status TEXT,                    -- e.g., 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

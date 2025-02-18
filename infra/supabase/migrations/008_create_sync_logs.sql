CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sync_type TEXT,                 -- e.g., 'inventory', 'orders'
  status TEXT,                    -- e.g., 'success', 'failed'
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

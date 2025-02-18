CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,  -- 'Free', 'Starter', 'Pro'
  inventory_groups_limit INTEGER,  -- NULL for unlimited
  items_limit INTEGER,             -- NULL for unlimited
  ebay_auto_sync BOOLEAN NOT NULL DEFAULT FALSE,  -- Free: manual sync, Starter/Pro: auto sync
  ebay_sync_interval INTEGER,      -- in seconds (e.g., Free: 86400, Starter: 21600, Pro: 3600)
  orders_sync TEXT,                -- e.g., 'last 5 orders', 'last 30 days', 'unlimited'
  bulk_listing_limit INTEGER,      -- NULL for unlimited
  email_notification_level TEXT,   -- 'none', 'daily', 'full'
  multi_channel_sync BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

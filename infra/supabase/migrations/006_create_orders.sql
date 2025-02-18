CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_reference TEXT,           -- e.g., eBay order ID
  order_date TIMESTAMPTZ,
  details JSONB,                  -- store order details in JSON format
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

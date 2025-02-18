INSERT INTO subscription_plans
  (name, inventory_groups_limit, items_limit, ebay_auto_sync, ebay_sync_interval, orders_sync, bulk_listing_limit, email_notification_level, multi_channel_sync)
VALUES
  ('Free', 1, 500, FALSE, 86400, 'last 5 orders', 10, 'none', FALSE),
  ('Starter', 5, 5000, TRUE, 21600, 'last 30 days', 100, 'daily', FALSE),
  ('Pro', NULL, NULL, TRUE, 3600, 'unlimited', NULL, 'full', TRUE);

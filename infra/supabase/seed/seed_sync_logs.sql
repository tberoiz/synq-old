-- Inserts sample sync logs for the test user.
INSERT INTO sync_logs
  (user_id, sync_type, status, message)
SELECT id, 'inventory', 'success', 'Inventory sync completed successfully.'
FROM auth.users
WHERE email = 'test@synq.com';

INSERT INTO sync_logs
  (user_id, sync_type, status, message)
SELECT id, 'orders', 'failed', 'Order sync failed due to network error.'
FROM auth.users
WHERE email = 'test@synq.com';

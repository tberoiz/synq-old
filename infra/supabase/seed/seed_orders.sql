-- Inserts sample orders for the test user.
INSERT INTO orders
  (user_id, order_reference, order_date, details)
SELECT id, 'eBay-ORDER-001', NOW() - INTERVAL '1 day', '{"items": ["Blue-Eyes White Dragon"], "total": 50.00}'::jsonb
FROM auth.users
WHERE email = 'test@synq.com';

INSERT INTO orders
  (user_id, order_reference, order_date, details)
SELECT id, 'eBay-ORDER-002', NOW() - INTERVAL '2 days', '{"items": ["Dark Magician"], "total": 40.00}'::jsonb
FROM auth.users
WHERE email = 'test@synq.com';

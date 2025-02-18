-- Inserts a test inventory group for the test user.
-- We use a static UUID for the inventory group to reference in other seeds.
INSERT INTO inventory_groups
  (id, user_id, name)
SELECT '11111111-1111-1111-1111-111111111111', id, 'Test Inventory Group'
FROM auth.users
WHERE email = 'test@synq.com';

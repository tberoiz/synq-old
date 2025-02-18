-- Inserts a sample bulk listing record for the test user.
INSERT INTO bulk_listings
  (user_id, inventory_group_id, listing_count, status)
SELECT id, '11111111-1111-1111-1111-111111111111', 5, 'completed'
FROM auth.users
WHERE email = 'test@synq.com';

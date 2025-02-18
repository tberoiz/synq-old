-- Creates a profile for the test user.
INSERT INTO profiles
  (id, full_name, subscription_plan_id)
SELECT id, 'Test User', 1
FROM auth.users
WHERE email = 'test@synq.com';

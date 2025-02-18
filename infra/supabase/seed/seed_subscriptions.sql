
-- Creates a subscription for the test user.
INSERT INTO subscriptions 
  (user_id, plan_id, stripe_subscription_id, status, start_date)
SELECT id, 1, 'stripe_sub_12345', 'active', NOW()
FROM auth.users
WHERE email = 'test@synq.com';

DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Fetch the user ID for the test user
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'test@synq.com';
  -- Seed user_sales_batches
  INSERT INTO user_sales_batches (id, user_id, name, created_at)
  VALUES
    ('990e8400-e29b-41d4-a716-446655440000', user_uuid, 'Spring 2024 Listings', now());

  --  Seed user_sales_batch_items
  INSERT INTO user_sales_batch_items (sales_batch_id, inventory_id, listing_price, quantity_to_list)
  VALUES
    ('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 25.00, 5), -- Charizard
    ('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 15.00, 10); -- Pikachu

  -- Seed user_listings
  INSERT INTO user_listings (id, user_id, inventory_id, sales_batch_id, ebay_listing_id, quantity_sold, sale_price, listed_at, sold_at, created_at)
  VALUES
    ('aa0e8400-e29b-41d4-a716-446655440000', user_uuid, '880e8400-e29b-41d4-a716-446655440000', '990e8400-e29b-41d4-a716-446655440000', 'EBAY12345', 2, 25.00, now(), now(), now()); -- Charizard sold
END $$;

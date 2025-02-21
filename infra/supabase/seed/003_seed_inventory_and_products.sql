DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Fetch the user ID for the test user
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = 'test@synq.com';

  -- Seed global_collections
  INSERT INTO global_collections (id, name, code, created_at)
  VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Magic: The Gathering', 'MTG', now()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Pokémon', 'POK', now()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Yu-Gi-Oh!', 'YGO', now());

  -- Seed global_cards
  INSERT INTO global_cards (id, collection_id, name, image_url, rarity, created_at)
  VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Charizard', 'https://example.com/charizard.jpg', 'Rare', now()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pikachu', 'https://example.com/pikachu.jpg', 'Common', now()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Black Lotus', 'https://example.com/black-lotus.jpg', 'Mythic', now()),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Blue-Eyes White Dragon', 'https://example.com/blue-eyes.jpg', 'Ultra Rare', now()),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Dark Magician', 'https://example.com/dark-magician.jpg', 'Ultra Rare', now());

  -- Seed user_collections
  INSERT INTO user_collections (id, name, code, created_at, user_id)
  VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Magic: The Gathering', 'MTG', now(), user_uuid),
    ('550e8400-e29b-41d4-a716-446655440000', 'Pokémon', 'POK', now(), user_uuid),
    ('550e8400-e29b-41d4-a716-446655440002', 'Yu-Gi-Oh!', 'YGO', now(), user_uuid);

  -- Seed user_acquisition_batches
  INSERT INTO user_acquisition_batches (id, user_id, name, created_at)
  VALUES
    ('770e8400-e29b-41d4-a716-446655440001', user_uuid, 'April 2024 MTG Purchase', now()),
    ('770e8400-e29b-41d4-a716-446655440000', user_uuid, 'March 2024 Pokémon Purchase', now()),
    ('770e8400-e29b-41d4-a716-446655440002', user_uuid, 'May 2024 Yu-Gi-Oh! Purchase', now());

  -- Seed user_inventory
  INSERT INTO user_inventory (id, user_id, acquisition_batch_id, global_card_id, collection_id, custom_name, quantity, cogs, listing_price, created_at)
  VALUES
    ('880e8400-e29b-41d4-a716-446655440000', user_uuid, '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Charizard', 10, 5.00, 10.00, now()),
    ('880e8400-e29b-41d4-a716-446655440001', user_uuid, '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pikachu', 20, 2.50, 5.00, now()),
    ('880e8400-e29b-41d4-a716-446655440002', user_uuid, '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Black Lotus', 1, 1000.00, 1100.00, now()),
    ('880e8400-e29b-41d4-a716-446655440003', user_uuid, '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Blue-Eyes White Dragon', 5, 50.00, 80.00, now()),
    ('880e8400-e29b-41d4-a716-446655440004', user_uuid, '770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Dark Magician', 3, 30.00, 60.00, now());
END $$;

-- Function to get batch statistics
CREATE OR REPLACE FUNCTION get_batch_stats(user_id_param UUID)
RETURNS TABLE (
  acquisition_batch_id UUID,
  item_count INT,
  total_cogs NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    acquisition_batch_id,
    COUNT(*) AS item_count,
    COALESCE(SUM(cogs), 0) AS total_cogs
  FROM user_inventory
  WHERE user_id = user_id_param
  GROUP BY acquisition_batch_id;
END;
$$ LANGUAGE plpgsql;

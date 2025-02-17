DO $$
DECLARE
    mtg_inventory_id BIGINT;
    pokemon_inventory_id BIGINT;
BEGIN
    -- Retrieve inventory IDs for test user
    SELECT id INTO mtg_inventory_id FROM public.inventories WHERE name = 'Magic: The Gathering';
    SELECT id INTO pokemon_inventory_id FROM public.inventories WHERE name = 'Pokemon Cards';

    -- Insert items into the inventories
    INSERT INTO public.items (inventory_id, name, stock, price, platforms, image, created_at, updated_at) VALUES
        -- Items for Magic: The Gathering
        (mtg_inventory_id, 'Black Lotus', 1, 99999.99, '["TCGPlayer", "eBay"]'::JSONB, 'https://example.com/black_lotus.jpg', current_timestamp, current_timestamp),
        (mtg_inventory_id, 'Mox Sapphire', 2, 4999.99, '["TCGPlayer"]'::JSONB, 'https://example.com/mox_sapphire.jpg', current_timestamp, current_timestamp),

        -- Items for Pokemon Cards
        (pokemon_inventory_id, 'Charizard Holo 1st Edition', 1, 30000.00, '["eBay", "Shopify"]'::JSONB, 'https://example.com/charizard.jpg', current_timestamp, current_timestamp),
        (pokemon_inventory_id, 'Pikachu Illustrator', 1, 250000.00, '["Cardmarket"]'::JSONB, 'https://example.com/pikachu_illustrator.jpg', current_timestamp, current_timestamp);

END $$;

-- Helper function to create item and its purchase batch
CREATE OR REPLACE FUNCTION create_item_and_batch(
    p_user_id uuid,
    p_group_id uuid,
    p_name text,
    p_default_cogs numeric,
    p_listing_price numeric,
    p_quantity int,
    p_unit_cost numeric,
    p_batch_name text
) RETURNS void AS $func$
BEGIN
    -- Create inventory item
    INSERT INTO user_inventory_items (
        user_id, 
        inventory_group_id, 
        name, 
        default_cogs, 
        listing_price
    )
    VALUES (
        p_user_id,
        p_group_id,
        p_name,
        p_default_cogs,
        p_listing_price
    );

    -- Create purchase batch for this item
    WITH new_batch AS (
        INSERT INTO user_purchase_batches (
            user_id, 
            name
        )
        VALUES (
            p_user_id, 
            p_batch_name
        )
        RETURNING id, user_id
    ),
    new_item AS (
        SELECT id 
        FROM user_inventory_items 
        WHERE user_id = p_user_id 
        AND name = p_name 
        ORDER BY created_at DESC 
        LIMIT 1
    )
    INSERT INTO user_purchase_items (
        user_id,
        batch_id,
        item_id,
        quantity,
        remaining_quantity,
        unit_cost
    ) 
    SELECT 
        new_batch.user_id,
        new_batch.id,
        new_item.id,
        p_quantity,
        p_quantity,
        p_unit_cost
    FROM new_batch, new_item;
END;
$func$ LANGUAGE plpgsql;

-- Seed inventory groups and products
DO $$
DECLARE
    user_uuid uuid;
    electronics_id uuid;
    accessories_id uuid;
    clothing_id uuid;
    home_goods_id uuid;
    sports_id uuid;
    toys_id uuid;
    books_id uuid;
BEGIN
    -- Get all test users
    FOR user_uuid IN SELECT id FROM temp_users LOOP
        -- Create inventory groups
        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Electronics')
        RETURNING id INTO electronics_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Accessories')
        RETURNING id INTO accessories_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Clothing')
        RETURNING id INTO clothing_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Home Goods')
        RETURNING id INTO home_goods_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Sports')
        RETURNING id INTO sports_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Toys')
        RETURNING id INTO toys_id;

        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, 'Books')
        RETURNING id INTO books_id;

        -- Electronics
        PERFORM create_item_and_batch(
            user_uuid, electronics_id,
            'Wireless Earbuds Pro',
            45.00, 99.99,
            100, 42.50,
            '2024-Q1 Wireless Earbuds Pro Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, electronics_id,
            'USB-C Dock Premium',
            25.00, 49.99,
            50, 20.00,
            '2024-Q1 USB-C Dock Premium Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, electronics_id,
            'Webcam 4K Pro',
            65.00, 129.99,
            30, 55.00,
            '2024-Q1 Webcam 4K Pro Order'
        );

        -- Accessories
        PERFORM create_item_and_batch(
            user_uuid, accessories_id,
            'Premium Phone Case',
            12.00, 29.99,
            200, 8.00,
            '2024-Q1 Premium Phone Case Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, accessories_id,
            'Wireless Charger',
            15.00, 34.99,
            75, 12.50,
            '2024-Q1 Wireless Charger Order'
        );

        -- Clothing
        PERFORM create_item_and_batch(
            user_uuid, clothing_id,
            'Cotton T-Shirt',
            8.00, 19.99,
            300, 5.00,
            '2024-Q1 Cotton T-Shirt Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, clothing_id,
            'Denim Jeans',
            25.00, 59.99,
            100, 20.00,
            '2024-Q1 Denim Jeans Order'
        );

        -- Home Goods
        PERFORM create_item_and_batch(
            user_uuid, home_goods_id,
            'Smart LED Bulb',
            12.00, 29.99,
            150, 8.00,
            '2024-Q1 Smart LED Bulb Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, home_goods_id,
            'Coffee Maker',
            35.00, 79.99,
            50, 25.00,
            '2024-Q1 Coffee Maker Order'
        );

        -- Sports
        PERFORM create_item_and_batch(
            user_uuid, sports_id,
            'Yoga Mat',
            15.00, 34.99,
            100, 10.00,
            '2024-Q1 Yoga Mat Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, sports_id,
            'Resistance Bands Set',
            20.00, 44.99,
            75, 15.00,
            '2024-Q1 Resistance Bands Set Order'
        );

        -- Toys
        PERFORM create_item_and_batch(
            user_uuid, toys_id,
            'Building Blocks Set',
            25.00, 59.99,
            50, 20.00,
            '2024-Q1 Building Blocks Set Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, toys_id,
            'Remote Control Car',
            35.00, 79.99,
            30, 25.00,
            '2024-Q1 Remote Control Car Order'
        );

        -- Books
        PERFORM create_item_and_batch(
            user_uuid, books_id,
            'Business Strategy Book',
            15.00, 34.99,
            100, 10.00,
            '2024-Q1 Business Strategy Book Order'
        );

        PERFORM create_item_and_batch(
            user_uuid, books_id,
            'Cookbook Collection',
            25.00, 59.99,
            50, 20.00,
            '2024-Q1 Cookbook Collection Order'
        );
    END LOOP;
END $$;

-- Clean up
DROP FUNCTION create_item_and_batch;


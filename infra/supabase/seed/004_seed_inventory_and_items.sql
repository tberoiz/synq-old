-- Helper function to create item and its purchase batch
CREATE OR REPLACE FUNCTION create_item_and_batch(
    p_user_id uuid,
    p_group_id uuid,
    p_name text,
    p_default_cogs numeric,
    p_listing_price numeric,
    p_quantity int,
    p_unit_cost numeric
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
            '2024-Q1 ' || p_name || ' Order'
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
BEGIN
    -- Get test user
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Create inventory groups
    INSERT INTO user_inventory_groups (user_id, name)
    VALUES (user_uuid, 'Electronics')
    RETURNING id INTO electronics_id;

    INSERT INTO user_inventory_groups (user_id, name)
    VALUES (user_uuid, 'Accessories')
    RETURNING id INTO accessories_id;

    -- Create all items
    PERFORM create_item_and_batch(
        user_uuid, electronics_id,
        'Wireless Earbuds',
        45.00, 99.99,
        100, 42.50
    );

    PERFORM create_item_and_batch(
        user_uuid, electronics_id,
        'USB-C Dock',
        15.00, 29.99,
        50, 12.50
    );

    PERFORM create_item_and_batch(
        user_uuid, electronics_id,
        'Webcam 4K',
        45.00, 89.99,
        30, 40.00
    );

    PERFORM create_item_and_batch(
        user_uuid, accessories_id,
        'Phone Case',
        8.00, 19.99,
        200, 5.00
    );

    PERFORM create_item_and_batch(
        user_uuid, electronics_id,
        'Mechanical Keyboard',
        25.00, 49.99,
        50, 20.00
    );
END $$;

-- Clean up
DROP FUNCTION create_item_and_batch;


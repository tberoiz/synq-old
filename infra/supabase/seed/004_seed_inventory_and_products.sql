-- Seed inventory groups and products
DO $$
DECLARE
    user_uuid uuid;
    group_id uuid;
    item_id uuid;
    batch_id uuid;
    purchase_item_id uuid;
BEGIN
    -- Get test user
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Create inventory group
    INSERT INTO user_inventory_groups (user_id, name)
    VALUES (user_uuid, 'Electronics')
    RETURNING id INTO group_id;

    -- Create inventory item
    INSERT INTO user_inventory_items (user_id, inventory_group_id, name, default_cogs, listing_price)
    VALUES (
        user_uuid,
        group_id,
        'Wireless Headphones',
        45.00,
        99.99
    )
    RETURNING id INTO item_id;

    -- Create purchase batch
    INSERT INTO user_purchase_batches (user_id, name)
    VALUES (user_uuid, '2024-Q1 Supplier Order')
    RETURNING id INTO batch_id;

    -- Create purchase items
    INSERT INTO user_purchase_items (
        user_id,
        batch_id,
        item_id,
        quantity,
        remaining_quantity,
        unit_cost
    ) VALUES (
        user_uuid,
        batch_id,
        item_id,
        100,
        100,
        42.50  -- Special discounted price for this batch
    )
    RETURNING id INTO purchase_item_id;

    -- Create sales
    INSERT INTO user_sales (user_id, purchase_item_id, sold_quantity, sale_price)
    VALUES
        (user_uuid, purchase_item_id, 30, 99.99),
        (user_uuid, purchase_item_id, 50, 89.99);
END $$;


-- Seed sales transactions and order details
DO $$
DECLARE
    user_uuid uuid;
    sale_id uuid;
    earbuds_purchase uuid;
    dock_purchase uuid;
    camera_purchase uuid;
    case_purchase uuid;
    keyboard_purchase uuid;
BEGIN
    -- Get test user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Get purchase item IDs
    SELECT id INTO earbuds_purchase FROM user_purchase_items WHERE item_id = (
        SELECT id FROM user_inventory_items WHERE name = 'Wireless Earbuds' AND user_id = user_uuid
    ) LIMIT 1;

    SELECT id INTO dock_purchase FROM user_purchase_items WHERE item_id = (
        SELECT id FROM user_inventory_items WHERE name = 'USB-C Dock' AND user_id = user_uuid
    ) LIMIT 1;

    SELECT id INTO camera_purchase FROM user_purchase_items WHERE item_id = (
        SELECT id FROM user_inventory_items WHERE name = 'Webcam 4K' AND user_id = user_uuid
    ) LIMIT 1;

    SELECT id INTO case_purchase FROM user_purchase_items WHERE item_id = (
        SELECT id FROM user_inventory_items WHERE name = 'Phone Case' AND user_id = user_uuid
    ) LIMIT 1;

    SELECT id INTO keyboard_purchase FROM user_purchase_items WHERE item_id = (
        SELECT id FROM user_inventory_items WHERE name = 'Mechanical Keyboard' AND user_id = user_uuid
    ) LIMIT 1;

    -- Create completed sale with multiple items
    INSERT INTO user_sales (
        user_id,
        status,
        platform,
        sale_date,
        shipping_cost,
        tax_amount,
        platform_fees,
        notes
    )
    VALUES (
        user_uuid,
        'completed',
        'ebay',
        '2024-03-15',
        8.00,
        12.50,
        20.00,
        'Bundle sale of earbuds and dock'
    )
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (
        user_id,
        sale_id,
        purchase_item_id,
        sold_quantity,
        sale_price
    )
    VALUES
        (user_uuid, sale_id, earbuds_purchase, 2, 79.99),
        (user_uuid, sale_id, dock_purchase, 1, 29.99);

    -- Create listed sale with camera and cases
    INSERT INTO user_sales (
        user_id,
        status,
        platform,
        sale_date,
        shipping_cost,
        tax_amount,
        platform_fees,
        notes
    )
    VALUES (
        user_uuid,
        'listed',
        'amazon',
        '2024-03-16',
        5.00,
        9.75,
        15.00,
        'Camera with protective cases'
    )
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (
        user_id,
        sale_id,
        purchase_item_id,
        sold_quantity,
        sale_price
    )
    VALUES
        (user_uuid, sale_id, camera_purchase, 1, 89.99),
        (user_uuid, sale_id, case_purchase, 3, 19.99);

    -- Create completed keyboard sale
    INSERT INTO user_sales (
        user_id,
        status,
        platform,
        sale_date,
        shipping_cost,
        tax_amount,
        platform_fees,
        notes
    )
    VALUES (
        user_uuid,
        'completed',
        'etsy',
        '2024-03-17',
        0.00,
        3.00,
        5.00,
        'Custom mechanical keyboard'
    )
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (
        user_id,
        sale_id,
        purchase_item_id,
        sold_quantity,
        sale_price
    )
    VALUES
        (user_uuid, sale_id, keyboard_purchase, 1, 49.99);

END $$;

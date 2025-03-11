-- Seed sales transactions and order details
DO $$
DECLARE
    user_uuid uuid;
    sale_id uuid;
    purchase_item_id uuid;
BEGIN
    -- Get test user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Create sale for USB-C Dock
    SELECT pi.id INTO purchase_item_id
    FROM user_purchase_items pi
    JOIN user_purchase_batches pb ON pi.batch_id = pb.id
    WHERE pb.name = '2024-Q1 USB-C Dock Order' 
    AND pb.user_id = user_uuid
    LIMIT 1;

    IF purchase_item_id IS NOT NULL THEN
        -- First create as listed
        INSERT INTO user_sales (
            user_id, status, platform, sale_date, 
            shipping_cost, tax_amount, platform_fees, notes
        )
        VALUES (
            user_uuid, 'listed', 'ebay', '2024-03-15',
            5.00, 2.50, 1.50, 'USB-C Dock Sale'
        )
        RETURNING id INTO sale_id;

        INSERT INTO user_sale_items (
            user_id, sale_id, purchase_item_id, sold_quantity, sale_price
        )
        VALUES (user_uuid, sale_id, purchase_item_id, 20, 29.99);

        -- Then update to completed to trigger inventory update
        UPDATE user_sales SET status = 'completed' WHERE id = sale_id;
    END IF;

    -- Create sale for Mechanical Keyboard
    SELECT pi.id INTO purchase_item_id
    FROM user_purchase_items pi
    JOIN user_purchase_batches pb ON pi.batch_id = pb.id
    WHERE pb.name = '2024-Q1 Mechanical Keyboard Order'
    AND pb.user_id = user_uuid
    LIMIT 1;

    IF purchase_item_id IS NOT NULL THEN
        -- First create as listed
        INSERT INTO user_sales (
            user_id, status, platform, sale_date,
            shipping_cost, tax_amount, platform_fees, notes
        )
        VALUES (
            user_uuid, 'listed', 'amazon', '2024-03-16',
            8.00, 4.00, 2.50, 'Mechanical Keyboard Sale'
        )
        RETURNING id INTO sale_id;

        INSERT INTO user_sale_items (
            user_id, sale_id, purchase_item_id, sold_quantity, sale_price
        )
        VALUES (user_uuid, sale_id, purchase_item_id, 15, 49.99);

        -- Then update to completed to trigger inventory update
        UPDATE user_sales SET status = 'completed' WHERE id = sale_id;
    END IF;

    -- Create sale for Webcam
    SELECT pi.id INTO purchase_item_id
    FROM user_purchase_items pi
    JOIN user_purchase_batches pb ON pi.batch_id = pb.id
    WHERE pb.name = '2024-Q1 Webcam 4K Order'
    AND pb.user_id = user_uuid
    LIMIT 1;

    IF purchase_item_id IS NOT NULL THEN
        -- First create as listed
        INSERT INTO user_sales (
            user_id, status, platform, sale_date,
            shipping_cost, tax_amount, platform_fees, notes
        )
        VALUES (
            user_uuid, 'listed', 'shopify', '2024-03-17',
            10.00, 5.00, 3.00, 'Webcam 4K Sale'
        )
        RETURNING id INTO sale_id;

        INSERT INTO user_sale_items (
            user_id, sale_id, purchase_item_id, sold_quantity, sale_price
        )
        VALUES (user_uuid, sale_id, purchase_item_id, 10, 89.99);

        -- Then update to completed to trigger inventory update
        UPDATE user_sales SET status = 'completed' WHERE id = sale_id;
    END IF;

    -- Create sale for Wireless Earbuds
    SELECT pi.id INTO purchase_item_id
    FROM user_purchase_items pi
    JOIN user_purchase_batches pb ON pi.batch_id = pb.id
    WHERE pb.name = '2024-Q1 Wireless Earbuds Order'
    AND pb.user_id = user_uuid
    LIMIT 1;

    IF purchase_item_id IS NOT NULL THEN
        -- First create as listed
        INSERT INTO user_sales (
            user_id, status, platform, sale_date,
            shipping_cost, tax_amount, platform_fees, notes
        )
        VALUES (
            user_uuid, 'listed', 'etsy', '2024-03-18',
            6.00, 3.00, 2.00, 'Wireless Earbuds Sale'
        )
        RETURNING id INTO sale_id;

        INSERT INTO user_sale_items (
            user_id, sale_id, purchase_item_id, sold_quantity, sale_price
        )
        VALUES (user_uuid, sale_id, purchase_item_id, 25, 79.99);

        -- Then update to completed to trigger inventory update
        UPDATE user_sales SET status = 'completed' WHERE id = sale_id;
    END IF;

END $$;

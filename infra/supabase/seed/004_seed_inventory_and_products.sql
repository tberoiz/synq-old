DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user UUID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Seed user_inv_categories table
    INSERT INTO user_inv_categories (user_id, name)
    VALUES
        (user_uuid, 'Electronics'),
        (user_uuid, 'Clothing'),
        (user_uuid, 'Books'),
        (user_uuid, 'Home Decor');

    -- Seed user_inv_suppliers table
    INSERT INTO user_inv_suppliers (user_id, name, contact_info)
    VALUES
        (user_uuid, 'Tech Gadgets Inc.', 'sales@techgadgets.com'),
        (user_uuid, 'Fashion Trends Co.', 'info@fashiontrends.com'),
        (user_uuid, 'Book Haven Ltd.', 'support@bookhaven.com'),
        (user_uuid, 'Home Essentials LLC', 'contact@homeessentials.com');

    -- Seed user_inv_acquisition_batches table
    INSERT INTO user_inv_acquisition_batches (user_id, suppliers, name)
    VALUES
        (
            user_uuid,
            ARRAY[(SELECT id FROM user_inv_suppliers WHERE name = 'Tech Gadgets Inc.')],
            'Q1 2024 Electronics Batch'
        ),
        (
            user_uuid,
            ARRAY[
                (SELECT id FROM user_inv_suppliers WHERE name = 'Fashion Trends Co.'),
                (SELECT id FROM user_inv_suppliers WHERE name = 'Tech Gadgets Inc.')
            ],
            'Spring 2024 Clothing Collection'
        ),
        (
            user_uuid,
            ARRAY[(SELECT id FROM user_inv_suppliers WHERE name = 'Book Haven Ltd.')],
            '2024 Bestsellers Batch'
        ),
        (
            user_uuid,
            ARRAY[(SELECT id FROM user_inv_suppliers WHERE name = 'Home Essentials LLC')],
            'Q1 2024 Home Decor Batch'
        );

    -- Seed user_inv_items table without images
    INSERT INTO user_inv_items (
        user_id,
        acquisition_batch_id,
        category_id,
        name,
        sku,
        quantity,
        cogs,
        listing_price,
        image_urls,
        created_at
    )
    VALUES
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Q1 2024 Electronics Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Electronics'),
            'Wireless Noise-Canceling Headphones',
            'SKU12345',
            50,
            75.00,
            149.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Q1 2024 Electronics Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Electronics'),
            'Smartwatch with Heart Rate Monitor',
            'SKU67890',
            30,
            120.00,
            199.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Spring 2024 Clothing Collection'),
            (SELECT id FROM user_inv_categories WHERE name = 'Clothing'),
            'Men’s Casual T-Shirt (Pack of 3)',
            'SKU54321',
            100,
            15.00,
            29.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Spring 2024 Clothing Collection'),
            (SELECT id FROM user_inv_categories WHERE name = 'Clothing'),
            'Women’s Summer Dress',
            'SKU98765',
            60,
            25.00,
            49.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = '2024 Bestsellers Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Books'),
            'The Midnight Library by Matt Haig',
            'SKU11223',
            200,
            5.00,
            12.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = '2024 Bestsellers Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Books'),
            'Atomic Habits by James Clear',
            'SKU44556',
            150,
            6.00,
            14.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Q1 2024 Home Decor Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Home Decor'),
            'Ceramic Table Vase',
            'SKU77889',
            40,
            10.00,
            24.99,
            ARRAY[]::text[],
            NOW()
        ),
        (
            user_uuid,
            (SELECT id FROM user_inv_acquisition_batches WHERE name = 'Q1 2024 Home Decor Batch'),
            (SELECT id FROM user_inv_categories WHERE name = 'Home Decor'),
            'Modern Wall Clock',
            'SKU99001',
            25,
            20.00,
            39.99,
            ARRAY[]::text[],
            NOW()
        );
END $$;

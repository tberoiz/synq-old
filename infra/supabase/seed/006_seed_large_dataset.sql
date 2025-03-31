-- Helper function to create a sale
CREATE OR REPLACE FUNCTION create_sale(
    p_user_id uuid,
    p_purchase_item_id uuid,
    p_status sale_status,
    p_platform sale_platform,
    p_sale_date date,
    p_shipping_cost numeric,
    p_tax_amount numeric,
    p_platform_fees numeric,
    p_notes text,
    p_sold_quantity int,
    p_sale_price numeric
) RETURNS uuid AS $$
DECLARE
    sale_id uuid;
BEGIN
    -- First create as listed
    INSERT INTO user_sales (
        user_id, status, platform, sale_date,
        shipping_cost, tax_amount, platform_fees, notes
    )
    VALUES (
        p_user_id, p_status, p_platform, p_sale_date,
        p_shipping_cost, p_tax_amount, p_platform_fees, p_notes
    )
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (
        user_id, sale_id, purchase_item_id, sold_quantity, sale_price
    )
    VALUES (p_user_id, sale_id, p_purchase_item_id, p_sold_quantity, p_sale_price);

    -- If status is completed, update the sale
    IF p_status = 'completed' THEN
        UPDATE user_sales SET status = 'completed' WHERE id = sale_id;
    END IF;

    RETURN sale_id;
END;
$$ LANGUAGE plpgsql;

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

-- Helper function to generate random product names
CREATE OR REPLACE FUNCTION generate_product_name(category text) RETURNS text AS $$
DECLARE
    prefixes text[] := ARRAY['Premium', 'Ultra', 'Pro', 'Elite', 'Max', 'Plus', 'Lite', 'Smart', 'Advanced', 'Modern'];
    suffixes text[] := ARRAY['2024', 'Series', 'Edition', 'Collection', 'Bundle', 'Kit', 'Set', 'Pack', 'Deluxe', 'Special'];
BEGIN
    RETURN prefixes[1 + floor(random() * array_length(prefixes, 1))::int] || ' ' || 
           category || ' ' || 
           suffixes[1 + floor(random() * array_length(suffixes, 1))::int];
END;
$$ LANGUAGE plpgsql;

-- Helper function to generate random prices
CREATE OR REPLACE FUNCTION generate_prices(category text) RETURNS record AS $$
DECLARE
    result record;
    base_price numeric;
BEGIN
    CASE category
        WHEN 'Electronics' THEN base_price := 50 + random() * 950;
        WHEN 'Accessories' THEN base_price := 20 + random() * 180;
        WHEN 'Clothing' THEN base_price := 15 + random() * 85;
        WHEN 'Home Goods' THEN base_price := 25 + random() * 175;
        WHEN 'Sports' THEN base_price := 30 + random() * 170;
        WHEN 'Toys' THEN base_price := 25 + random() * 125;
        WHEN 'Books' THEN base_price := 10 + random() * 90;
        ELSE base_price := 20 + random() * 180;
    END CASE;
    
    result := ROW(
        base_price * 0.6, -- default_cogs (60% of listing price)
        base_price,       -- listing_price
        (1 + random() * 4)::int * 25, -- unit_cost (25-100% of default_cogs)
        (10 + random() * 990)::int    -- quantity
    )::record;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create inventory groups first
DO $$
DECLARE
    user_uuid uuid;
    group_id uuid;
    group_name text;
    categories text[] := ARRAY['Electronics', 'Accessories', 'Clothing', 'Home Goods', 'Sports', 'Toys', 'Books'];
BEGIN
    -- Get the first test user
    SELECT id INTO user_uuid FROM temp_users LIMIT 1;
    
    -- Create inventory groups for each category
    FOREACH group_name IN ARRAY categories LOOP
        INSERT INTO user_inventory_groups (user_id, name)
        VALUES (user_uuid, group_name)
        RETURNING id INTO group_id;
    END LOOP;
END $$;

-- Seed large dataset of inventory items and purchases
DO $$
DECLARE
    user_uuid uuid;
    group_id uuid;
    group_name text;
    item_name text;
    base_price numeric;
    default_cogs numeric;
    listing_price numeric;
    unit_cost numeric;
    quantity int;
    categories text[] := ARRAY['Electronics', 'Accessories', 'Clothing', 'Home Goods', 'Sports', 'Toys', 'Books'];
    subcategories text[] := ARRAY['Gaming', 'Audio', 'Video', 'Mobile', 'Computing', 'Fitness', 'Outdoor', 'Indoor', 'Educational', 'Entertainment'];
    items_per_category int[] := ARRAY[1000, 800, 800, 800, 600, 600, 400]; -- Total: 5000 items
BEGIN
    -- Get the first test user
    SELECT id INTO user_uuid FROM temp_users LIMIT 1;
    
    -- Create items for each category
    FOR i IN 1..array_length(categories, 1) LOOP
        group_name := categories[i];
        
        -- Get the group ID
        SELECT id INTO group_id 
        FROM user_inventory_groups 
        WHERE user_id = user_uuid AND name = group_name;

        -- Generate items for this category
        FOR j IN 1..items_per_category[i] LOOP
            -- Generate random subcategory
            item_name := generate_product_name(subcategories[1 + floor(random() * array_length(subcategories, 1))::int]);
            
            -- Generate prices based on category
            CASE group_name
                WHEN 'Electronics' THEN base_price := 50 + random() * 950;
                WHEN 'Accessories' THEN base_price := 20 + random() * 180;
                WHEN 'Clothing' THEN base_price := 15 + random() * 85;
                WHEN 'Home Goods' THEN base_price := 25 + random() * 175;
                WHEN 'Sports' THEN base_price := 30 + random() * 170;
                WHEN 'Toys' THEN base_price := 25 + random() * 125;
                WHEN 'Books' THEN base_price := 10 + random() * 90;
                ELSE base_price := 20 + random() * 180;
            END CASE;
            
            -- Calculate derived values
            default_cogs := base_price * 0.6;
            listing_price := base_price;
            unit_cost := (1 + floor(random() * 4)::int) * 25;
            quantity := (10 + floor(random() * 990)::int);
            
            -- Create item and batch
            PERFORM create_item_and_batch(
                user_uuid,
                group_id,
                item_name,
                default_cogs,
                listing_price,
                quantity,
                unit_cost,
                '2024-Q1 ' || item_name || ' Order'
            );
        END LOOP;
    END LOOP;
END $$;

-- Seed large dataset of sales
DO $$
DECLARE
    user_uuid uuid;
    purchase_item record;
    sale_id uuid;
    sale_date date;
    platforms sale_platform[] := ARRAY['ebay'::sale_platform, 'amazon'::sale_platform, 'etsy'::sale_platform, 'shopify'::sale_platform, 'other'::sale_platform];
    statuses sale_status[] := ARRAY['listed'::sale_status, 'completed'::sale_status, 'cancelled'::sale_status];
    sale_quantity int;
BEGIN
    -- Get the first test user
    SELECT id INTO user_uuid FROM temp_users LIMIT 1;
    
    -- Generate sales for each user's items
    FOR purchase_item IN 
        SELECT pi.id, pi.remaining_quantity
        FROM user_purchase_items pi
        JOIN user_purchase_batches pb ON pi.batch_id = pb.id
        WHERE pb.user_id = user_uuid
    LOOP
        -- Generate 5-15 sales per item
        FOR i IN 1..(5 + floor(random() * 11)::int) LOOP
            -- Random sale date between Jan 1, 2024 and Mar 31, 2024
            sale_date := '2024-01-01'::date + (random() * 90)::int;
            
            -- Calculate sale quantity (1-10% of remaining quantity)
            sale_quantity := least(
                (1 + floor(random() * 10)::int),
                purchase_item.remaining_quantity
            );
            
            -- Random platform and status
            sale_id := create_sale(
                user_uuid,
                purchase_item.id,
                statuses[1 + floor(random() * array_length(statuses, 1))::int],
                platforms[1 + floor(random() * array_length(platforms, 1))::int],
                sale_date,
                (5 + random() * 15)::numeric(10,2),
                (2 + random() * 8)::numeric(10,2),
                (1 + random() * 5)::numeric(10,2),
                'Test sale ' || i,
                sale_quantity,
                (20 + random() * 100)::numeric(10,2)
            );
        END LOOP;
    END LOOP;
END $$;

-- Clean up
DROP FUNCTION generate_product_name;
DROP FUNCTION generate_prices;
DROP FUNCTION create_item_and_batch; 
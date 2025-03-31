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

-- Seed sales transactions and order details
DO $$
DECLARE
    user_uuid uuid;
    purchase_item_id uuid;
    sale_id uuid;
    sale_date date;
    platforms sale_platform[] := ARRAY['ebay'::sale_platform, 'amazon'::sale_platform, 'etsy'::sale_platform, 'shopify'::sale_platform, 'other'::sale_platform];
    statuses sale_status[] := ARRAY['listed'::sale_status, 'completed'::sale_status, 'cancelled'::sale_status];
BEGIN
    -- Get all test users
    FOR user_uuid IN SELECT id FROM temp_users LOOP
        -- Generate sales for each user's items
        FOR purchase_item_id IN 
            SELECT pi.id 
            FROM user_purchase_items pi
            JOIN user_purchase_batches pb ON pi.batch_id = pb.id
            WHERE pb.user_id = user_uuid
        LOOP
            -- Generate 2-4 sales per item
            FOR i IN 1..(2 + floor(random() * 3)::int) LOOP
                -- Random sale date between Jan 1, 2024 and Mar 31, 2024
                sale_date := '2024-01-01'::date + (random() * 90)::int;
                
                -- Random platform and status
                sale_id := create_sale(
                    user_uuid,
                    purchase_item_id,
                    statuses[1 + floor(random() * array_length(statuses, 1))::int],
                    platforms[1 + floor(random() * array_length(platforms, 1))::int],
                    sale_date,
                    (5 + random() * 15)::numeric(10,2),
                    (2 + random() * 8)::numeric(10,2),
                    (1 + random() * 5)::numeric(10,2),
                    'Test sale ' || i,
                    (1 + random() * 10)::int,
                    (20 + random() * 100)::numeric(10,2)
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Clean up
DROP FUNCTION create_sale;

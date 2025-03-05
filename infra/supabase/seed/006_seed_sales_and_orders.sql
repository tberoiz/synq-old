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
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Get purchase item IDs
    SELECT id INTO earbuds_purchase FROM user_purchase_items WHERE quantity = 500;
    SELECT id INTO dock_purchase FROM user_purchase_items WHERE quantity = 300;
    SELECT id INTO camera_purchase FROM user_purchase_items WHERE quantity = 150;
    SELECT id INTO case_purchase FROM user_purchase_items WHERE quantity = 1000;
    SELECT id INTO keyboard_purchase FROM user_purchase_items WHERE quantity = 200;

    -- Create sales orders
    INSERT INTO user_sales (user_id, sale_date, total_revenue, tax_amount, shipping_cost)
    VALUES 
        (user_uuid, '2024-03-15', 189.97, 12.50, 8.00)
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (sale_id, purchase_item_id, quantity_sold, unit_price)
    VALUES
        (sale_id, earbuds_purchase, 2, 79.99),
        (sale_id, dock_purchase, 1, 29.99);

    PERFORM decrement_purchase_item_quantity(earbuds_purchase, 2);
    PERFORM decrement_purchase_item_quantity(dock_purchase, 1);

    INSERT INTO user_sales (user_id, sale_date, total_revenue, tax_amount, shipping_cost)
    VALUES 
        (user_uuid, '2024-03-16', 147.96, 9.75, 5.00)
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (sale_id, purchase_item_id, quantity_sold, unit_price)
    VALUES
        (sale_id, camera_purchase, 1, 89.99),
        (sale_id, case_purchase, 3, 19.99);

    PERFORM decrement_purchase_item_quantity(camera_purchase, 1);
    PERFORM decrement_purchase_item_quantity(case_purchase, 3);

    INSERT INTO user_sales (user_id, sale_date, total_revenue, tax_amount, shipping_cost)
    VALUES 
        (user_uuid, '2024-03-17', 49.99, 3.00, 0.00)
    RETURNING id INTO sale_id;

    INSERT INTO user_sale_items (sale_id, purchase_item_id, quantity_sold, unit_price)
    VALUES
        (sale_id, keyboard_purchase, 1, 49.99);

    PERFORM decrement_purchase_item_quantity(keyboard_purchase, 1);
END $$;

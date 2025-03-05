-- Seed inventory groups and products
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Create Inventory Groups
    INSERT INTO user_inventory_groups (user_id, name)
    VALUES
        (user_uuid, 'Audio Equipment'),
        (user_uuid, 'Mobile Accessories'),
        (user_uuid, 'Smart Home Devices'),
        (user_uuid, 'Other Electronics');

    -- Create Inventory Items
    INSERT INTO user_inventory_items (user_id, inventory_group_id, name, listing_price)
    VALUES
        (user_uuid, (SELECT id FROM user_inventory_groups WHERE name = 'Audio Equipment'), 'Wireless Bluetooth Earbuds', 79.99),
        (user_uuid, (SELECT id FROM user_inventory_groups WHERE name = 'Mobile Accessories'), 'Smartphone Charging Dock', 29.99),
        (user_uuid, (SELECT id FROM user_inventory_groups WHERE name = 'Smart Home Devices'), 'Smart WiFi Security Camera', 89.99),
        (user_uuid, (SELECT id FROM user_inventory_groups WHERE name = 'Mobile Accessories'), 'Premium Phone Case', 19.99),
        (user_uuid, (SELECT id FROM user_inventory_groups WHERE name = 'Other Electronics'), 'Wireless Keyboard & Mouse Combo', 49.99);
END $$;

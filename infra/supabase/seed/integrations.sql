-- Insert integration channels
INSERT INTO public.integration_channels (name, description, status, icon_url)
VALUES
    ('TCGPlayer', 'Sync your TCGPlayer inventory effortlessly. Track sales, manage listings, and update stock levels in real-time. Perfect for TCG sellers looking to streamline their operations and maximize profits.', 'active', '/icons/tcgplayer.svg'),
    ('Cardmarket', 'Connect your Cardmarket account to automate inventory updates and sales tracking. Stay on top of your orders and stock levels with seamless integration designed for TCG and collectible sellers.', 'active', '/icons/cardmarket.svg'),
    ('eBay', 'Integrate your eBay store to sync inventory, track orders, and manage listings from one dashboard. Ideal for sellers who want to simplify multi-channel selling and focus on growing their business.', 'active', '/icons/ebay.svg'),

-- Insert user integrations for the test user
DO $$
DECLARE
    test_user_uuid UUID;
    tcg_id UUID;
BEGIN
    -- Retrieve the UUID of the test user
    SELECT id INTO test_user_uuid
    FROM auth.users
    WHERE email = 'test@refrom.com';

    -- Retrieve the ID of the TCGPlayer integration
    SELECT id INTO tcg_id
    FROM public.integration_channels
    WHERE name = 'TCGPlayer';

    -- Insert user integrations
    INSERT INTO public.user_integrations (user_id, integration_channel_id, is_enabled, config)
    VALUES
        (test_user_uuid, tcg_id, true, '{"api_key": "test_123", "last_sync": "2025-02-05"}'),
        (test_user_uuid, (SELECT id FROM public.integration_channels WHERE name = 'eBay'), false, '{"auth_token": null}');
END $$;

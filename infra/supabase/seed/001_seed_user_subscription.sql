DO $$
DECLARE
    user_uuid UUID;
    plan_basic_uuid UUID;
    plan_pro_uuid UUID;
    plan_enterprise_uuid UUID;
BEGIN
    -- Retrieve test user ID from auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'test@synq.com';

    -- Insert Subscription Plans and get their UUIDs individually
    INSERT INTO public.subscription_plans (id, name, price, billing_cycle, description)
    VALUES (extensions.uuid_generate_v4(), 'Basic', 9.99, 'monthly', 'Basic plan with limited features')
    RETURNING id INTO plan_basic_uuid;

    INSERT INTO public.subscription_plans (id, name, price, billing_cycle, description)
    VALUES (extensions.uuid_generate_v4(), 'Pro', 29.99, 'monthly', 'Pro plan with full access to all features')
    RETURNING id INTO plan_pro_uuid;

    INSERT INTO public.subscription_plans (id, name, price, billing_cycle, description)
    VALUES (extensions.uuid_generate_v4(), 'Enterprise', 99.99, 'yearly', 'Enterprise plan with priority support and API access')
    RETURNING id INTO plan_enterprise_uuid;

    -- Insert User Subscription
    INSERT INTO public.user_subscriptions (id, user_id, plan_id, status, started_at, expires_at)
    VALUES (
        extensions.uuid_generate_v4(), user_uuid, plan_pro_uuid, 'active', NOW(), NOW() + INTERVAL '1 month'
    );

    -- Insert Subscription History for Upgrades
    INSERT INTO public.subscription_history (id, user_id, old_plan_id, new_plan_id, change_type, changed_at)
    VALUES (
        extensions.uuid_generate_v4(), user_uuid, plan_basic_uuid, plan_pro_uuid, 'upgrade', NOW() - INTERVAL '15 days'
    );

    -- Insert default User Settings with inventory_layout defaulting to 'grid'
    INSERT INTO public.user_settings (id, user_id, inventory_layout)
    VALUES (
        extensions.uuid_generate_v4(), user_uuid, DEFAULT
    );
END $$;

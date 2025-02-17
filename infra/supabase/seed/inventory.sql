-- Add inventory data for the test user
DO $$
DECLARE
    test_user_uuid UUID;
BEGIN
    -- Retrieve the UUID of the test user (assuming only one user exists for seeding purposes)
    SELECT id INTO test_user_uuid
    FROM auth.users
    WHERE email = 'test@synq.com';

    -- Insert inventory records for the test user
    INSERT INTO public.inventories (user_id, name, created_at, updated_at)
    VALUES
        -- (test_user_uuid, 'Baseball Cards', 'A collection of baseball cards from the 90s', current_timestamp, current_timestamp),
        (test_user_uuid, 'Magic: The Gathering', current_timestamp, current_timestamp),
        (test_user_uuid, 'Pokemon Cards', current_timestamp, current_timestamp);
END $$;

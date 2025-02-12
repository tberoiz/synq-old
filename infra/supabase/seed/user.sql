-- Create a single test user in the "auth.users" table
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        extensions.uuid_generate_v4(), -- Unique ID
        'authenticated',
        'authenticated',
        'test@decko.com', -- Specific email
        extensions.crypt('test', extensions.gen_salt('bf')), -- Specific password
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}', -- App metadata
        '{"full_name":"Test User","avatar_url":"https://i.pravatar.cc/300", "email":"test@decko.com"}', -- User metadata
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_uuid;

    -- Add identity for the test user in "auth.identities"
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        extensions.uuid_generate_v4(),
        user_uuid,
        user_uuid,
        format('{"sub":"%s","email":"%s"}', user_uuid::text, 'test@decko.com')::jsonb,
        'email',
        current_timestamp,
        current_timestamp,
        current_timestamp
    );
END $$;

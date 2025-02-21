DO $$
DECLARE
    user_uuid UUID;
BEGIN
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at,
        last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        extensions.uuid_generate_v4(), -- Generate unique ID
        'authenticated',
        'authenticated',
        'test@synq.com', -- Test email
        extensions.crypt('test', extensions.gen_salt('bf')), -- Test password
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}', -- App metadata
        '{"full_name":"Test User","avatar_url":"https://i.pravatar.cc/300", "email":"test@synq.com"}', -- User metadata
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_uuid;

    -- Add identity for the test user in "auth.identities"
    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
        extensions.uuid_generate_v4(),
        user_uuid,
        user_uuid,
        format('{"sub":"%s","email":"%s"}', user_uuid::text, 'test@synq.com')::jsonb,
        'email',
        current_timestamp,
        current_timestamp,
        current_timestamp
    );

    -- Store user_uuid for other seed files
    CREATE TEMP TABLE temp_user (id UUID);
    INSERT INTO temp_user (id) VALUES (user_uuid);
END $$;

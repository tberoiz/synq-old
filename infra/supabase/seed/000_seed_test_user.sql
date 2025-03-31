DO $$
DECLARE
    user_uuid UUID;
    i INTEGER;
    emails TEXT[] := ARRAY['test@synq.com', 'admin@synq.com', 'seller1@synq.com', 'seller2@synq.com'];
    names TEXT[] := ARRAY['Test User', 'Admin User', 'Seller One', 'Seller Two'];
BEGIN
    FOR i IN 1..array_length(emails, 1) LOOP
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at,
            last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            extensions.uuid_generate_v4(),
            'authenticated',
            'authenticated',
            emails[i],
            extensions.crypt('test', extensions.gen_salt('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            format('{"full_name":"%s", "email":"%s"}', 
                   names[i], emails[i])::jsonb,
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_uuid;

        -- Add identity for each user
        INSERT INTO auth.identities (
            id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            extensions.uuid_generate_v4(),
            user_uuid,
            user_uuid,
            format('{"sub":"%s","email":"%s"}', user_uuid::text, emails[i])::jsonb,
            'email',
            current_timestamp,
            current_timestamp,
            current_timestamp
        );

        -- Store user_uuid for other seed files
        CREATE TEMP TABLE IF NOT EXISTS temp_users (id UUID);
        INSERT INTO temp_users (id) VALUES (user_uuid);
    END LOOP;
END $$;

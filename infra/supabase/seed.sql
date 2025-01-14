SET session_replication_role = replica;

-- PostgreSQL database dump

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a single test user
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
        'test@gaia.com', -- Specific email
        extensions.crypt('test', extensions.gen_salt('bf')), -- Specific password
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}', -- App metadata
        '{"full_name":"Test User","avatar_url":"https://i.pravatar.cc/300", "email":"test@gaia.com"}', -- User metadata
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_uuid;

    -- Add identity for the test user
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
        format('{"sub":"%s","email":"%s"}', user_uuid::text, 'test@gaia.com')::jsonb,
        'email',
        current_timestamp,
        current_timestamp,
        current_timestamp
    );

    -- DUMMY DATA
    INSERT INTO public.inventories (user_id, name, description)
    VALUES
      (user_uuid, 'Baseball Cards', 'A collection of baseball cards from the 90s'),
      (user_uuid, 'Magic: The Gathering', 'MTG collection including rares and foils');
END $$;

-- PostgreSQL database dump complete
RESET ALL;

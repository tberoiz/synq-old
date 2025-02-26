-- CREATE TABLE public.available_integrations (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     platform_name text NOT NULL UNIQUE, -- 'eBay', 'Amazon', 'Shopify', etc.
--     authentication_method text NOT NULL CHECK (authentication_method IN ('API Key', 'OAuth')),
--     description text NULL,
--     status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'coming soon', 'deprecated')),
--     created_at timestamp with time zone DEFAULT now()
-- );

-- CREATE TABLE public.user_integrations (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     platform_id uuid NOT NULL REFERENCES available_integrations(id) ON DELETE CASCADE,
--     api_key text NULL,
--     oauth_token text NULL,
--     integration_status text NOT NULL DEFAULT 'inactive' CHECK (integration_status IN ('active', 'inactive', 'error')),
--     last_synced timestamp with time zone NULL,
--     created_at timestamp with time zone DEFAULT now()
-- );


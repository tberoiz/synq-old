CREATE TABLE global_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE global_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id uuid REFERENCES global_collections(id) ON DELETE CASCADE,
    name text NOT NULL,
    image_url text,
    rarity text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    code text NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_acquisition_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    acquisition_batch_id uuid NOT NULL REFERENCES user_acquisition_batches(id) ON DELETE CASCADE,
    global_card_id uuid REFERENCES global_cards(id) ON DELETE SET NULL,
    collection_id uuid REFERENCES user_collections(id) ON DELETE SET NULL,
    custom_name text,
    quantity integer NOT NULL CHECK (quantity >= 0),
    cogs numeric(10,2) NOT NULL CHECK (cogs >= 0),
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

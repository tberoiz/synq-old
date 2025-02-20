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
    custom_name text,
    cogs numeric(10,2) NOT NULL CHECK (cogs >= 0),
    quantity integer NOT NULL CHECK (quantity >= 0),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_sales_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_sales_batch_items (
    sales_batch_id uuid NOT NULL REFERENCES user_sales_batches(id) ON DELETE CASCADE,
    inventory_id uuid NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    quantity_to_list integer NOT NULL CHECK (quantity_to_list >= 1),
    PRIMARY KEY (sales_batch_id, inventory_id)
);

CREATE TABLE user_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id uuid NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    sales_batch_id uuid REFERENCES user_sales_batches(id) ON DELETE SET NULL,
    ebay_listing_id text NOT NULL,
    quantity_sold integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
    sale_price numeric(10,2),
    listed_at timestamptz DEFAULT now(),
    sold_at timestamptz,
    created_at timestamptz DEFAULT now()
);

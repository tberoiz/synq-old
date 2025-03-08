BEGIN;

-- Tables
CREATE TABLE IF NOT EXISTS user_inventory_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS user_inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_group_id uuid REFERENCES user_inventory_groups(id) ON DELETE SET NULL,
    name text NOT NULL,
    default_cogs NUMERIC(10,2) DEFAULT 0 CHECK (default_cogs >= 0),
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    sku text NULL,
    image_urls text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_archived boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_purchase_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'archived')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_purchase_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id uuid NOT NULL REFERENCES user_purchase_batches(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES user_inventory_items(id) ON DELETE CASCADE,
    quantity int NOT NULL CHECK (quantity > 0),
    remaining_quantity int NOT NULL CHECK (remaining_quantity >= 0 AND remaining_quantity <= quantity),
    unit_cost numeric(10, 2) NOT NULL CHECK (unit_cost >= 0),
    created_at timestamptz DEFAULT now()
);

-- Triggers and Functions
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_purchase_batches
    SET status = CASE
        WHEN 0 = (
            SELECT SUM(remaining_quantity)
            FROM user_purchase_items
            WHERE batch_id = NEW.batch_id
        ) THEN 'sold_out'
        ELSE 'active'
    END
    WHERE id = NEW.batch_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_batch_status
AFTER INSERT OR UPDATE ON user_purchase_items
FOR EACH ROW EXECUTE FUNCTION update_batch_status();

END;

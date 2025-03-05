-- Create user_inventory_groups table
CREATE TABLE user_inventory_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- Create user_inventory_items table
CREATE TABLE user_inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_group_id uuid REFERENCES user_inventory_groups(id) ON DELETE SET NULL,
    name text NOT NULL,
    default_cogs NUMERIC(10,2) DEFAULT 0 CHECK (default_cogs >= 0),
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    image_urls text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_archived boolean NOT NULL DEFAULT FALSE
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_inventory_items
CREATE TRIGGER update_item_modtime
BEFORE UPDATE ON user_inventory_items
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS on user_inventory_items
ALTER TABLE user_inventory_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own items"
ON user_inventory_items
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own items"
ON user_inventory_items
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own items"
ON user_inventory_items
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own items"
ON user_inventory_items
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

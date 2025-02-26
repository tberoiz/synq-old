-- Create user_inv_categories table
CREATE TABLE user_inv_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- Create user_inv_suppliers table
CREATE TABLE user_inv_suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    contact_info text
);

-- Create user_inv_acquisition_batches table
CREATE TABLE user_inv_acquisition_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    suppliers uuid[] DEFAULT ARRAY[]::uuid[],
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_inv_items table
CREATE TABLE user_inv_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    acquisition_batch_id uuid REFERENCES user_inv_acquisition_batches(id) ON DELETE SET NULL,
    category_id uuid REFERENCES user_inv_categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    sku text UNIQUE NULL,
    quantity integer NOT NULL CHECK (quantity >= 0),
    cogs numeric(10,2) NOT NULL CHECK (cogs >= 0),
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    image_urls text[] DEFAULT ARRAY[]::text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create a trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the user_inv_items table
CREATE TRIGGER update_item_modtime
BEFORE UPDATE ON user_inv_items
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- Enable RLS on the user_inv_items table
alter table user_inv_items enable row level security;


-- Policy: Users can read their own items
create policy "Users can read their own items"
on user_inv_items
for select
to authenticated
using (
  user_id = auth.uid()
);

-- Policy: Users can only update their own items
create policy "Users can update their own items"
on user_inv_items
for update
to authenticated
using (
  user_id = auth.uid()
);

-- Policy: Users can only delete their own items
create policy "Users can delete their own items"
on user_inv_items
for delete
to authenticated
using (
  user_id = auth.uid()
);

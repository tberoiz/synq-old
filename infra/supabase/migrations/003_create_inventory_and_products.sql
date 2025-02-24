-- Create user_categories table
CREATE TABLE user_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- Create user_suppliers table
CREATE TABLE user_suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    contact_info text
);

-- Create user_acquisition_batches table
CREATE TABLE user_acquisition_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id uuid REFERENCES user_suppliers(id) ON DELETE SET NULL,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create user_inventory table
CREATE TABLE user_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    acquisition_batch_id uuid REFERENCES user_acquisition_batches(id) ON DELETE SET NULL,
    category_id uuid REFERENCES user_categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    quantity integer NOT NULL CHECK (quantity >= 0),
    cogs numeric(10,2) NOT NULL CHECK (cogs >= 0),
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    created_at timestamptz DEFAULT now()
);

-- Create user_suppliers table
CREATE TABLE user_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255),
    payment_terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_suppliers_user ON user_suppliers(user_id);

-- Create user_purchase_batches table
CREATE TABLE user_purchase_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id uuid REFERENCES user_suppliers(id) ON DELETE SET NULL,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_user_purchase_batches_supplier ON user_purchase_batches(supplier_id);

-- Create user_purchase_items table
CREATE TABLE user_purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES user_purchase_batches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES user_inventory_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(10, 2) NOT NULL CHECK (unit_cost >= 0),-- True source of COGS
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_purchase_items_batch ON user_purchase_items(batch_id);
CREATE INDEX idx_user_purchase_items_item ON user_purchase_items(item_id);

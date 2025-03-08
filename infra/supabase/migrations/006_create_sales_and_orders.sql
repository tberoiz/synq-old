BEGIN;

-- Sales Status Enum
CREATE TYPE sale_status AS ENUM ('listed', 'completed', 'cancelled');

-- Sales Platform Enum
CREATE TYPE sale_platform AS ENUM ('ebay', 'amazon', 'etsy', 'shopify', 'other');

-- Sales Tables
CREATE TABLE IF NOT EXISTS user_sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status sale_status NOT NULL DEFAULT 'listed',
    platform sale_platform NOT NULL,
    sale_date timestamptz DEFAULT now(),
    shipping_cost numeric(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    tax_amount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    platform_fees numeric(10, 2) NOT NULL DEFAULT 0 CHECK (platform_fees >= 0),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Sale Items (Junction table between sales and purchase items)
CREATE TABLE IF NOT EXISTS user_sale_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sale_id uuid NOT NULL REFERENCES user_sales(id) ON DELETE CASCADE,
    purchase_item_id uuid NOT NULL REFERENCES user_purchase_items(id) ON DELETE CASCADE,
    sold_quantity int NOT NULL CHECK (sold_quantity > 0),
    sale_price numeric(10, 2) NOT NULL CHECK (sale_price >= 0),
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_sales_user_id_idx ON user_sales(user_id);
CREATE INDEX IF NOT EXISTS user_sales_status_idx ON user_sales(status);
CREATE INDEX IF NOT EXISTS user_sales_date_idx ON user_sales(sale_date);
CREATE INDEX IF NOT EXISTS user_sale_items_sale_id_idx ON user_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS user_sale_items_purchase_item_id_idx ON user_sale_items(purchase_item_id);

-- Enable RLS
ALTER TABLE user_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sales
CREATE POLICY "Users can view their own sales"
    ON user_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
    ON user_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
    ON user_sales FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
    ON user_sales FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_sale_items
CREATE POLICY "Users can view their own sale items"
    ON user_sale_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sale items"
    ON user_sale_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sale items"
    ON user_sale_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sale items"
    ON user_sale_items FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_user_sales_timestamp
BEFORE UPDATE ON user_sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent over-sale trigger
CREATE OR REPLACE FUNCTION prevent_over_sale()
RETURNS TRIGGER AS $$
DECLARE
    remaining int;
BEGIN
    SELECT remaining_quantity INTO remaining
    FROM user_purchase_items
    WHERE id = NEW.purchase_item_id;

    IF remaining < NEW.sold_quantity THEN
        RAISE EXCEPTION 'Not enough stock. Remaining: %', remaining;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_prevent_over_sale
BEFORE INSERT ON user_sale_items
FOR EACH ROW EXECUTE FUNCTION prevent_over_sale();

-- Update inventory when sale is completed
CREATE OR REPLACE FUNCTION update_inventory_on_sale_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update inventory if the status is changing to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE user_purchase_items pi
        SET remaining_quantity = remaining_quantity - si.sold_quantity
        FROM user_sale_items si
        WHERE si.sale_id = NEW.id
        AND pi.id = si.purchase_item_id;
    -- Restore inventory if the status is changing from 'completed' to something else
    ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        UPDATE user_purchase_items pi
        SET remaining_quantity = remaining_quantity + si.sold_quantity
        FROM user_sale_items si
        WHERE si.sale_id = NEW.id
        AND pi.id = si.purchase_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_inventory_on_sale_completion
AFTER UPDATE OF status ON user_sales
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_sale_completion();

END;

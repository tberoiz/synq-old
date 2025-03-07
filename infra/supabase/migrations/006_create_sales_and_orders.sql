-- CREATE TABLE user_sales (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     sale_date date NOT NULL,
--     total_revenue numeric(10,2) CHECK (total_revenue >= 0),
--     tax_amount numeric(10,2) DEFAULT 0,
--     shipping_cost numeric(10,2) DEFAULT 0,
--     customer_notes text,
--     created_at timestamptz DEFAULT now()
-- );

-- CREATE INDEX idx_sales_user ON user_sales(user_id);
-- CREATE INDEX idx_sales_date ON user_sales(sale_date);

-- -- Create the user_sale_items table with the new column and modified cogs
-- CREATE TABLE user_sale_items (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     sale_id uuid NOT NULL REFERENCES user_sales(id) ON DELETE CASCADE,
--     purchase_item_id uuid NOT NULL REFERENCES user_purchase_items(id) ON DELETE CASCADE,
--     quantity_sold int NOT NULL CHECK (quantity_sold > 0),
--     unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
--     purchase_unit_cost numeric(10,2) NOT NULL CHECK (purchase_unit_cost >= 0), -- New column
--     cogs numeric(10,2) GENERATED ALWAYS AS (quantity_sold * purchase_unit_cost) STORED
-- );

-- -- Create trigger function to set purchase_unit_cost on insert
-- CREATE OR REPLACE FUNCTION set_purchase_unit_cost()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     SELECT unit_cost INTO NEW.purchase_unit_cost
--     FROM user_purchase_items
--     WHERE id = NEW.purchase_item_id;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Attach the trigger to the user_sale_items table
-- CREATE TRIGGER trg_set_purchase_unit_cost
-- BEFORE INSERT ON user_sale_items
-- FOR EACH ROW EXECUTE FUNCTION set_purchase_unit_cost();

-- -- Create indexes (as per original migration)
-- CREATE INDEX idx_user_sale_items_sale ON user_sale_items(sale_id);
-- CREATE INDEX idx_user_sale_items_batch_item ON user_sale_items(purchase_item_id);

-- CREATE OR REPLACE FUNCTION decrement_purchase_item_quantity(
--   purchase_item_id uuid,
--   quantity_to_decrement int
-- )
-- RETURNS void AS $$
-- BEGIN
--   UPDATE user_purchase_items
--   SET quantity = greatest(user_purchase_items.quantity - quantity_to_decrement, 0)
--   WHERE id = purchase_item_id;
-- END;
-- $$ LANGUAGE plpgsql;

BEGIN;

-- Enable RLS on all tables
ALTER TABLE user_inventory_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchase_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchase_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_inventory_groups
CREATE POLICY "Users can view their own inventory groups"
    ON user_inventory_groups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory groups"
    ON user_inventory_groups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory groups"
    ON user_inventory_groups FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory groups"
    ON user_inventory_groups FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_inventory_items
CREATE POLICY "Users can view their own inventory items"
    ON user_inventory_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
    ON user_inventory_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
    ON user_inventory_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
    ON user_inventory_items FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_purchase_batches
CREATE POLICY "Users can view their own purchase batches"
    ON user_purchase_batches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase batches"
    ON user_purchase_batches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase batches"
    ON user_purchase_batches FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase batches"
    ON user_purchase_batches FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_purchase_items
CREATE POLICY "Users can view their own purchase items"
    ON user_purchase_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase items"
    ON user_purchase_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase items"
    ON user_purchase_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase items"
    ON user_purchase_items FOR DELETE
    USING (auth.uid() = user_id);

-- Set security_invoker for views
ALTER VIEW vw_items_ui_table SET (security_invoker = on);
ALTER VIEW vw_sales_ui_table SET (security_invoker = on);
ALTER VIEW vw_purchases_ui_table SET (security_invoker = on);

END;

BEGIN;

-- Function to delete an item and its associated records
CREATE OR REPLACE FUNCTION delete_item(item_id_param uuid)
RETURNS void AS $$
BEGIN
    -- Delete associated sale items first
    DELETE FROM user_sale_items
    WHERE purchase_item_id IN (
        SELECT id FROM user_purchase_items
        WHERE item_id = item_id_param
    );

    -- Delete associated purchase items
    DELETE FROM user_purchase_items
    WHERE item_id = item_id_param;

    -- Delete empty purchase batches
    DELETE FROM user_purchase_batches
    WHERE id IN (
        SELECT DISTINCT batch_id
        FROM user_purchase_items
        WHERE item_id = item_id_param
    )
    AND NOT EXISTS (
        SELECT 1
        FROM user_purchase_items
        WHERE batch_id = user_purchase_batches.id
    );

    -- Finally, delete the item itself
    DELETE FROM user_inventory_items
    WHERE id = item_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a purchase batch and its associated records
CREATE OR REPLACE FUNCTION delete_purchase_batch(batch_id_param uuid)
RETURNS void AS $$
BEGIN
    -- Delete associated sale items first
    DELETE FROM user_sale_items
    WHERE purchase_item_id IN (
        SELECT id FROM user_purchase_items
        WHERE batch_id = batch_id_param
    );

    -- Delete purchase items
    DELETE FROM user_purchase_items
    WHERE batch_id = batch_id_param;

    -- Finally, delete the batch itself
    DELETE FROM user_purchase_batches
    WHERE id = batch_id_param;
END;
$$ LANGUAGE plpgsql;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON user_inventory_items;
DROP POLICY IF EXISTS "Users can delete their own purchase batches" ON user_purchase_batches;
DROP POLICY IF EXISTS "Users can delete their own purchase items" ON user_purchase_items;

-- Create RLS policies for deletion
CREATE POLICY "Users can delete their own inventory items"
    ON user_inventory_items FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase batches"
    ON user_purchase_batches FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase items"
    ON user_purchase_items FOR DELETE
    USING (auth.uid() = user_id);

END;

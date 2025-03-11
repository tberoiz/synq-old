BEGIN;

-- Items view for UI
CREATE OR REPLACE VIEW vw_items_ui_table AS
WITH completed_sales AS (
  SELECT
    pi.item_id,
    COALESCE(SUM(si.sold_quantity), 0) as total_sold
  FROM user_sale_items si
  JOIN user_purchase_items pi ON si.purchase_item_id = pi.id
  JOIN user_sales s ON si.sale_id = s.id
  WHERE s.status = 'completed'
  GROUP BY pi.item_id
)
SELECT
  i.id AS item_id,
  i.user_id,
  i.name AS item_name,
  i.sku,
  i.default_cogs,
  g.name AS category,
  i.listing_price,
  i.inventory_group_id,
  i.is_archived,
  COALESCE(SUM(p.remaining_quantity), 0) AS total_quantity,
  COALESCE(cs.total_sold, 0) AS total_sold,
  JSON_AGG(DISTINCT pb.*) AS purchase_batches
FROM user_inventory_items i
LEFT JOIN user_inventory_groups g ON i.inventory_group_id = g.id
LEFT JOIN user_purchase_items p ON i.id = p.item_id
LEFT JOIN user_purchase_batches pb ON p.batch_id = pb.id
LEFT JOIN completed_sales cs ON i.id = cs.item_id
GROUP BY i.id, g.name, i.inventory_group_id, i.is_archived, cs.total_sold;

-- Sales view for UI
CREATE OR REPLACE VIEW vw_sales_ui_table AS
WITH sale_totals AS (
    SELECT 
        si.sale_id,
        COUNT(DISTINCT si.id) as total_items,
        SUM(si.sold_quantity) as total_quantity,
        SUM(pi.unit_cost * si.sold_quantity) as total_cogs,
        SUM(si.sale_price * si.sold_quantity) as total_revenue
    FROM user_sale_items si
    JOIN user_purchase_items pi ON si.purchase_item_id = pi.id
    GROUP BY si.sale_id
)
SELECT 
    s.id,
    s.user_id,
    s.status,
    s.platform,
    s.sale_date,
    s.shipping_cost,
    s.tax_amount,
    s.platform_fees,
    s.notes,
    COALESCE(st.total_items, 0) as total_items,
    COALESCE(st.total_quantity, 0) as total_quantity,
    COALESCE(st.total_cogs, 0) as total_cogs,
    COALESCE(st.total_revenue, 0) as total_revenue,
    COALESCE(st.total_revenue, 0) - COALESCE(st.total_cogs, 0) - s.shipping_cost - s.tax_amount - s.platform_fees as net_profit,
    s.created_at,
    s.updated_at,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', si.id,
                'item_id', i.id,
                'name', i.name,
                'sku', i.sku,
                'quantity', si.sold_quantity,
                'unit_price', si.sale_price,
                'total_price', si.sale_price * si.sold_quantity,
                'unit_cost', pi.unit_cost,
                'total_cost', pi.unit_cost * si.sold_quantity,
                'profit', (si.sale_price * si.sold_quantity) - (pi.unit_cost * si.sold_quantity)
            )
        )
        FROM user_sale_items si
        JOIN user_purchase_items pi ON si.purchase_item_id = pi.id
        JOIN user_inventory_items i ON pi.item_id = i.id
        WHERE si.sale_id = s.id
    ) as items
FROM user_sales s
LEFT JOIN sale_totals st ON s.id = st.sale_id;

-- Purchases view for UI
CREATE OR REPLACE VIEW vw_purchases_ui_table AS
WITH purchase_stats AS (
    SELECT
        pi.batch_id,
        COUNT(DISTINCT pi.item_id) as unique_items,
        SUM(pi.quantity) as total_quantity,
        SUM(pi.remaining_quantity) as remaining_quantity,
        SUM(pi.quantity - pi.remaining_quantity) as sold_quantity,
        SUM(pi.unit_cost * pi.quantity) as total_cost,
        -- Calculate potential revenue based on item listing prices
        SUM(pi.quantity * i.listing_price) as potential_revenue,
        -- Calculate actual revenue from completed sales
        COALESCE(SUM(
            CASE 
                WHEN s.status = 'completed' 
                THEN si.sale_price * si.sold_quantity 
                ELSE 0 
            END
        ), 0) as actual_revenue,
        -- Calculate actual profit from completed sales
        COALESCE(SUM(
            CASE 
                WHEN s.status = 'completed' 
                THEN (si.sale_price * si.sold_quantity) - (pi.unit_cost * si.sold_quantity)
                ELSE 0 
            END
        ), 0) as actual_profit
    FROM user_purchase_items pi
    JOIN user_inventory_items i ON pi.item_id = i.id
    LEFT JOIN user_sale_items si ON pi.id = si.purchase_item_id
    LEFT JOIN user_sales s ON si.sale_id = s.id
    GROUP BY pi.batch_id
)
SELECT 
    pb.id,
    pb.user_id,
    pb.name,
    pb.status,
    pb.created_at,
    pb.updated_at,
    ps.unique_items,
    ps.total_quantity,
    ps.remaining_quantity,
    ps.sold_quantity,
    ps.total_cost,
    ps.potential_revenue,
    ps.actual_revenue,
    ps.actual_profit,
    -- Calculate sell-through rate
    ROUND((ps.sold_quantity::numeric / NULLIF(ps.total_quantity, 0)::numeric) * 100, 2) as sell_through_rate,
    -- Calculate average profit margin on sold items
    CASE 
        WHEN ps.actual_revenue > 0 
        THEN ROUND((ps.actual_profit::numeric / ps.actual_revenue::numeric) * 100, 2)
        ELSE 0 
    END as profit_margin,
    -- Include detailed items information
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', pi.id,
                'item_id', i.id,
                'name', i.name,
                'sku', i.sku,
                'quantity', pi.quantity,
                'remaining_quantity', pi.remaining_quantity,
                'unit_cost', pi.unit_cost,
                'total_cost', pi.unit_cost * pi.quantity,
                'listing_price', i.listing_price,
                'potential_revenue', i.listing_price * pi.quantity,
                'is_archived', i.is_archived
            )
        )
        FROM user_purchase_items pi
        JOIN user_inventory_items i ON pi.item_id = i.id
        WHERE pi.batch_id = pb.id
    ) as items
FROM user_purchase_batches pb
LEFT JOIN purchase_stats ps ON pb.id = ps.batch_id
ORDER BY 
    CASE WHEN pb.status = 'archived' THEN 1 ELSE 0 END,
    pb.created_at DESC;

END; 

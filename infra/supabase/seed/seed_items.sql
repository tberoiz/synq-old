-- Inserts sample items into the test inventory group.
-- Uses the static inventory group ID: '11111111-1111-1111-1111-111111111111'
INSERT INTO items
  (inventory_group_id, name, description, quantity, cost, price)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Blue-Eyes White Dragon', 'Legendary card from Yu-Gi-Oh!', 1, 15.00, 50.00),
  ('11111111-1111-1111-1111-111111111111', 'Dark Magician', 'Iconic card from Yu-Gi-Oh!', 2, 10.00, 40.00);

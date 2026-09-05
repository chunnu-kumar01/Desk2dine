-- =====================================================================
-- Desk2Dine — sample reference data.
--
-- IMPORTANT: this file is executed by SchemaInitializer only the FIRST
-- time (it checks "SELECT COUNT(*) FROM categories" and skips seeding if
-- rows already exist), so it will not create duplicates on every restart.
--
-- No user accounts are seeded here — real accounts are created through
-- the Signup screen so passwords always go through BCrypt in Java code.
-- A default admin account is created separately (see AdminBootstrap) so
-- its password hash is produced by the exact same jBCrypt version the
-- app uses to verify it.
-- =====================================================================

INSERT INTO categories (name, description) VALUES
    ('Beverages', 'Hot and cold drinks'),
    ('Snacks', 'Light bites and quick snacks'),
    ('Meals', 'Full plates and heavier items'),
    ('Desserts', 'Something sweet to finish');

INSERT INTO menu_items (category_id, name, description, price, is_available) VALUES
    ((SELECT id FROM categories WHERE name = 'Beverages'), 'Tea', 'Classic Indian masala chai', 10.00, 1),
    ((SELECT id FROM categories WHERE name = 'Beverages'), 'Coffee', 'Filter coffee, hot', 20.00, 1),
    ((SELECT id FROM categories WHERE name = 'Beverages'), 'Cold Coffee', 'Iced coffee with milk', 40.00, 1),
    ((SELECT id FROM categories WHERE name = 'Snacks'), 'Samosa', 'Deep-fried pastry with spiced filling', 15.00, 1),
    ((SELECT id FROM categories WHERE name = 'Snacks'), 'Vada Pav', 'Spiced potato fritter in a bun', 25.00, 1),
    ((SELECT id FROM categories WHERE name = 'Snacks'), 'Sandwich', 'Grilled vegetable sandwich', 35.00, 1),
    ((SELECT id FROM categories WHERE name = 'Meals'), 'Veg Thali', 'Full vegetarian meal with rice, dal, and sabzi', 90.00, 1),
    ((SELECT id FROM categories WHERE name = 'Meals'), 'Burger', 'Veg burger with fries', 50.00, 1),
    ((SELECT id FROM categories WHERE name = 'Meals'), 'Fried Rice', 'Vegetable fried rice', 60.00, 1),
    ((SELECT id FROM categories WHERE name = 'Desserts'), 'Gulab Jamun (2 pcs)', 'Deep-fried milk balls in sugar syrup', 30.00, 1);

INSERT INTO delivery_locations (name, block, floor) VALUES
    ('F-204, CSE Block', 'CSE Block', '2nd Floor'),
    ('S-101, Staff Room', 'Main Block', '1st Floor'),
    ('Principal Office', 'Admin Block', 'Ground Floor'),
    ('Library Reading Room', 'Library Block', '1st Floor'),
    ('Conference Hall', 'Main Block', '3rd Floor');

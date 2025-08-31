--
-- This script seeds the vehicle_rental database with initial data.
-- It populates the vehicle_types and vehicles tables as requested.
-- Updated to have 2-3 vehicles per type instead of 1
--
-- Ensure the correct database is used
USE vehicle_rental;

-- Insert vehicle types based on wheels (2 for bikes, 4 for cars)
-- These IDs will be used as foreign keys in the vehicles table.
INSERT INTO vehicle_types (id, name, wheels) VALUES
(1, 'Hatchback', 4),
(2, 'SUV', 4),
(3, 'Sedan', 4),
(4, 'Cruiser', 2);

-- Insert 2-3 vehicles for each type as requested
-- This provides more inventory while maintaining the same structure
INSERT INTO vehicles (name, type_id, price_per_day, is_available) VALUES
-- Hatchbacks (3 vehicles)
('Maruti Suzuki Swift', 1, 1500.00, TRUE),
('Hyundai i20', 1, 1600.00, TRUE),
('Tata Altroz', 1, 1550.00, TRUE),

-- SUVs (3 vehicles)
('Mahindra Scorpio', 2, 2500.00, TRUE),
('Tata Harrier', 2, 2800.00, TRUE),
('Mahindra XUV300', 2, 2300.00, TRUE),

-- Sedans (3 vehicles)
('Honda City', 3, 2000.00, TRUE),
('Maruti Suzuki Dzire', 3, 1800.00, TRUE),
('Hyundai Verna', 3, 2100.00, TRUE),

-- Cruisers (3 vehicles)
('Royal Enfield Classic 350', 4, 1000.00, TRUE),
('Royal Enfield Thunderbird', 4, 1100.00, TRUE),
('Royal Enfield Himalayan', 4, 1200.00, TRUE);
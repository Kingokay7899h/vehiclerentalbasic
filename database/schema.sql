--
-- This script creates the database and tables for the vehicle rental system.
-- It is designed to be executed once to set up the schema.
--

-- Drop the database if it already exists to ensure a clean slate
DROP DATABASE IF EXISTS vehicle_rental;

-- Create the new database
CREATE DATABASE vehicle_rental;

-- Use the newly created database
USE vehicle_rental;

-- Create the vehicle_types table to categorize vehicles
CREATE TABLE vehicle_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wheels INT NOT NULL
);

-- Create the vehicles table to store information about each vehicle
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type_id INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (type_id) REFERENCES vehicle_types(id)
);

-- Create the bookings table to track customer bookings
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
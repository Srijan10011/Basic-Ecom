-- Setup script for customer_list table

-- Create the customer_list table
CREATE TABLE IF NOT EXISTS customer_list (
    id UUID PRIMARY KEY,
    customer_name TEXT NOT NULL
);

-- Populate the customer_list table with distinct customers from the orders table
-- This assumes the orders table has a user_id (UUID) and customer_name
-- and that user_id is the foreign key to the user.
INSERT INTO customer_list (id, customer_name)
SELECT DISTINCT user_id, customer_name
FROM orders
ON CONFLICT (id) DO NOTHING;

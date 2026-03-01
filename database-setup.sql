-- Database Setup Script for BOlt Admin Panel
-- Run this in your Supabase SQL Editor

-- Option 1: Add an 'items' JSONB field to existing orders table
-- This is the simplest approach if you want to store order items as JSON
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Option 2: Create a proper order_items table (recommended for larger applications)
-- Uncomment the following lines if you prefer a normalized structure

/*
-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add some sample order items (replace with your actual data)
-- INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- (1, 1, 2, 29.99),
-- (1, 3, 1, 15.99),
-- (2, 2, 1, 49.99);
*/

-- Option 3: Update existing orders with sample items data
-- Uncomment and modify the following if you want to add sample data to existing orders

/*
-- Example: Add sample items to existing orders (modify as needed)
UPDATE orders 
SET items = '[{"product_id": 1, "name": "Sample Product", "quantity": 2, "price": 29.99}]'::jsonb
WHERE id = 1;

UPDATE orders 
SET items = '[{"product_id": 2, "name": "Another Product", "quantity": 1, "price": 49.99}]'::jsonb
WHERE id = 2;
*/

-- ===== REVIEW SYSTEM SETUP =====

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per user per product
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Create function to check if user can review a product
-- User can only review if they have a delivered order containing that product
CREATE OR REPLACE FUNCTION can_user_review_product(p_user_id UUID, p_product_id INTEGER)
RETURNS BOOLEAN AS $
DECLARE
    has_delivered_order BOOLEAN := FALSE;
BEGIN
    -- Check if user has any delivered orders containing this product
    -- This works with the items JSONB field approach
    -- Note: The items are stored with 'id' field, not 'product_id'
    SELECT EXISTS(
        SELECT 1 
        FROM orders o
        WHERE o.user_id = p_user_id 
        AND o.status = 'delivered'
        AND o.items IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(o.items) AS item
            WHERE (item->>'id')::INTEGER = p_product_id
        )
    ) INTO has_delivered_order;
    
    -- If using order_items table instead, uncomment this and comment above:
    /*
    SELECT EXISTS(
        SELECT 1 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = p_user_id 
        AND o.status = 'delivered'
        AND oi.product_id = p_product_id
    ) INTO has_delivered_order;
    */
    
    RETURN has_delivered_order;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get product reviews with user details
CREATE OR REPLACE FUNCTION get_product_reviews(p_product_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    rating INTEGER,
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    user_email TEXT
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.rating,
        r.comment,
        r.image_url,
        r.created_at,
        COALESCE(NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''), 'Anonymous')::TEXT as user_name,
        COALESCE(au.email, '')::TEXT as user_email
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    LEFT JOIN auth.users au ON r.user_id = au.id
    WHERE r.product_id = p_product_id
    ORDER BY r.created_at DESC;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get average rating for a product
CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT ROUND(AVG(rating::NUMERIC), 1)
    INTO avg_rating
    FROM reviews
    WHERE product_id = p_product_id;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get review count for a product
CREATE OR REPLACE FUNCTION get_product_review_count(p_product_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    review_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO review_count
    FROM reviews
    WHERE product_id = p_product_id;
    
    RETURN review_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS (Row Level Security) policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all reviews
CREATE POLICY "Users can read all reviews" ON reviews
    FOR SELECT USING (true);

-- Policy: Users can only insert reviews for products they can review
CREATE POLICY "Users can insert reviews for delivered products" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        can_user_review_product(auth.uid(), product_id)
    );

-- Policy: Users can only update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the changes
SELECT
    o.id,
    o.order_number,
    cd.customer_name,
    o.total_amount,
    o.status,
    o.items
FROM orders o
JOIN customer_detail cd
    ON o.customer_detail_id = cd.id
LIMIT 5;
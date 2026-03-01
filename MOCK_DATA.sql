-- ============================================
-- MOCK DATA FOR WEB-BOLT E-COMMERCE
-- Insert sample data for testing
-- ============================================

-- ============================================
-- 1. CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Fresh Mushrooms', 'fresh-mushrooms'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Dried Mushrooms', 'dried-mushrooms'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Mushroom Kits', 'mushroom-kits'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Supplements', 'supplements'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Organic Products', 'organic-products');

-- ============================================
-- 2. PRODUCTS
-- ============================================
INSERT INTO products (name, description, price, image, category_id, rating, reviews, badge, badgeColor, stockQuantity, location, is_featured) VALUES
    ('Shiitake Mushrooms', 'Fresh organic shiitake mushrooms, rich in flavor and nutrients', 12.99, 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.5, 23, 'Bestseller', 'bg-blue-500', 50, 'Local Farm', true),
    ('Oyster Mushrooms', 'Delicate oyster mushrooms perfect for stir-fries', 9.99, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.8, 45, 'Popular', 'bg-green-500', 75, 'Local Farm', true),
    ('Button Mushrooms', 'Classic white button mushrooms, versatile and mild', 6.99, 'https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.2, 67, NULL, NULL, 100, 'Local Farm', false),
    ('Portobello Mushrooms', 'Large meaty portobello mushrooms, great for grilling', 14.99, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.6, 34, 'Premium', 'bg-purple-500', 40, 'Organic Farm', true),
    ('Dried Porcini', 'Premium dried porcini mushrooms with intense flavor', 24.99, 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500', '550e8400-e29b-41d4-a716-446655440002', 4.9, 89, 'Premium', 'bg-yellow-500', 30, 'Italy Import', true),
    ('Dried Shiitake', 'Sun-dried shiitake mushrooms for soups and broths', 18.99, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500', '550e8400-e29b-41d4-a716-446655440002', 4.7, 56, NULL, NULL, 45, 'Japan Import', false),
    ('Mushroom Growing Kit', 'Complete kit to grow your own oyster mushrooms at home', 34.99, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500', '550e8400-e29b-41d4-a716-446655440003', 4.4, 28, 'New', 'bg-red-500', 25, 'USA', true),
    ('Lion''s Mane Kit', 'Grow exotic lion''s mane mushrooms in your kitchen', 39.99, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=500', '550e8400-e29b-41d4-a716-446655440003', 4.8, 41, 'Bestseller', 'bg-blue-500', 20, 'USA', false),
    ('Reishi Supplement', 'Organic reishi mushroom powder for immune support', 29.99, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500', '550e8400-e29b-41d4-a716-446655440004', 4.6, 92, 'Popular', 'bg-green-500', 60, 'USA', true),
    ('Cordyceps Extract', 'Premium cordyceps extract for energy and vitality', 44.99, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500', '550e8400-e29b-41d4-a716-446655440004', 4.7, 73, 'Premium', 'bg-purple-500', 35, 'China Import', false),
    ('Chanterelle Mushrooms', 'Wild-harvested golden chanterelle mushrooms', 32.99, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.9, 15, 'Premium', 'bg-yellow-500', 15, 'Forest Harvest', true),
    ('Enoki Mushrooms', 'Delicate enoki mushrooms perfect for Asian cuisine', 8.99, 'https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.3, 38, NULL, NULL, 55, 'Local Farm', false),
    ('Maitake Mushrooms', 'Hen of the woods mushrooms with rich umami flavor', 19.99, 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=500', '550e8400-e29b-41d4-a716-446655440001', 4.7, 29, 'New', 'bg-red-500', 28, 'Organic Farm', false),
    ('Mushroom Seasoning', 'Dried mushroom powder blend for cooking', 11.99, 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=500', '550e8400-e29b-41d4-a716-446655440002', 4.5, 64, NULL, NULL, 80, 'USA', false),
    ('Turkey Tail Extract', 'Organic turkey tail mushroom supplement', 26.99, 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500', '550e8400-e29b-41d4-a716-446655440004', 4.8, 51, 'Popular', 'bg-green-500', 42, 'USA', true);

-- ============================================
-- 3. PROFILES (Sample Users)
-- Note: These need to match auth.users IDs
-- Replace with actual user IDs after signup
-- ============================================
-- INSERT INTO profiles (id, first_name, last_name, email, role) VALUES
--     ('user-uuid-1', 'John', 'Doe', 'john@example.com', 'user'),
--     ('user-uuid-2', 'Jane', 'Smith', 'jane@example.com', 'user'),
--     ('admin-uuid-1', 'Admin', 'User', 'admin@example.com', 'admin');

-- ============================================
-- 4. CUSTOMER_DETAIL (Sample Customer Info)
-- ============================================
-- INSERT INTO customer_detail (user_id, customer_name, shipping_address) VALUES
--     ('user-uuid-1', 'John Doe', '{"phone": "+9779841234567", "address": "123 Main St", "city": "Kathmandu", "state": "Bagmati", "zipCode": "44600", "latitude": 27.7172, "longitude": 85.3240}'),
--     ('user-uuid-2', 'Jane Smith', '{"phone": "+9779851234567", "address": "456 Oak Ave", "city": "Pokhara", "state": "Gandaki", "zipCode": "33700", "latitude": 28.2096, "longitude": 83.9856}');

-- ============================================
-- 5. ORDERS (Sample Orders)
-- ============================================
-- INSERT INTO orders (id, order_number, user_id, customer_detail_id, total_amount, status, order_date, items) VALUES
--     ('order-uuid-1', 'ORD-1234567890', 'user-uuid-1', 1, 45.97, 'delivered', NOW() - INTERVAL '5 days', '[{"id": 1, "name": "Shiitake Mushrooms", "quantity": 2, "price": 12.99}, {"id": 2, "name": "Oyster Mushrooms", "quantity": 2, "price": 9.99}]'),
--     ('order-uuid-2', 'ORD-1234567891', 'user-uuid-1', 1, 24.99, 'shipped', NOW() - INTERVAL '2 days', '[{"id": 5, "name": "Dried Porcini", "quantity": 1, "price": 24.99}]'),
--     ('order-uuid-3', 'ORD-1234567892', 'user-uuid-2', 2, 34.99, 'processing', NOW() - INTERVAL '1 day', '[{"id": 7, "name": "Mushroom Growing Kit", "quantity": 1, "price": 34.99}]'),
--     ('order-uuid-4', 'ORD-1234567893', NULL, NULL, 29.99, 'pending', NOW(), '[{"id": 9, "name": "Reishi Supplement", "quantity": 1, "price": 29.99}]');

-- ============================================
-- 6. GUEST_ORDER (Sample Guest Orders)
-- ============================================
-- INSERT INTO guest_order (order_id, customer_name, customer_email, shipping_address) VALUES
--     ('order-uuid-4', 'Guest User', 'guest@example.com', '{"phone": "+9779861234567", "address": "789 Pine Rd", "city": "Lalitpur", "state": "Bagmati", "zipCode": "44700", "latitude": 27.6683, "longitude": 85.3206}');

-- ============================================
-- 7. REVIEWS (Sample Reviews)
-- Note: Requires actual user IDs and delivered orders
-- ============================================
-- INSERT INTO reviews (user_id, product_id, rating, comment, image_url) VALUES
--     ('user-uuid-1', 1, 5, 'Amazing quality! Fresh and flavorful shiitake mushrooms.', NULL),
--     ('user-uuid-1', 2, 5, 'Perfect for stir-fries. Will buy again!', NULL),
--     ('user-uuid-2', 7, 4, 'Great kit! Mushrooms started growing in just 5 days.', NULL);

-- ============================================
-- 8. USER_ADDRESSES (Sample Saved Addresses)
-- ============================================
-- INSERT INTO user_addresses (user_id, phone, address, city, state, zip_code, latitude, longitude) VALUES
--     ('user-uuid-1', '+9779841234567', '123 Main St', 'Kathmandu', 'Bagmati', '44600', 27.7172, 85.3240),
--     ('user-uuid-2', '+9779851234567', '456 Oak Ave', 'Pokhara', 'Gandaki', '33700', 28.2096, 83.9856);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check categories
SELECT COUNT(*) as category_count FROM categories;

-- Check products
SELECT COUNT(*) as product_count FROM products;

-- Check featured products
SELECT name, price, badge FROM products WHERE is_featured = true;

-- Check products by category
SELECT c.name as category, COUNT(p.id) as product_count 
FROM categories c 
LEFT JOIN products p ON c.id = p.category_id 
GROUP BY c.name;

-- ============================================
-- NOTES
-- ============================================
-- 1. Commented sections require actual user IDs from auth.users
-- 2. To use those sections:
--    - Sign up users first
--    - Get their UUIDs from auth.users table
--    - Replace 'user-uuid-1', 'user-uuid-2', etc. with actual UUIDs
--    - Then uncomment and run those INSERT statements
-- 3. Products and categories are ready to use immediately
-- ============================================

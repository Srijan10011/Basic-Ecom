-- ============================================
-- WEB-BOLT DATABASE SCHEMA
-- Generated from codebase analysis
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: categories
-- Used in: Shop.tsx, AdminPage.tsx, ProductDetail.tsx
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: products
-- Used in: Shop.tsx, ProductDetail.tsx, AdminPage.tsx, Cart.tsx, FeaturedProducts.tsx
-- Operations: SELECT, INSERT, UPDATE
-- ============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category_id UUID REFERENCES categories(id),
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    badge TEXT,
    "badgeColor" TEXT,
    details TEXT[],
    stockQuantity INTEGER DEFAULT 0,
    location TEXT,
    is_featured BOOLEAN DEFAULT false,
    product_owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category lookups
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_owner_id ON products(product_owner_id);

-- ============================================
-- TABLE: profiles
-- Used in: Signup.tsx, Profile.tsx, UpdateProfile.tsx, AdminPage.tsx
-- Operations: SELECT, INSERT, UPDATE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: cart_items
-- Used in: cart.ts (all cart operations)
-- Operations: SELECT, INSERT, UPDATE, DELETE, UPSERT
-- ============================================
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Indexes for cart operations
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ============================================
-- TABLE: customer_detail
-- Used in: Checkout.tsx, Profile.tsx, AdminPage.tsx
-- Operations: INSERT, SELECT
-- ============================================
CREATE TABLE customer_detail (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_customer_detail_user_id ON customer_detail(user_id);

-- ============================================
-- TABLE: orders
-- Used in: Checkout.tsx, Profile.tsx, AdminPage.tsx, TrackOrder.tsx
-- Operations: SELECT, INSERT, UPDATE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID,
    customer_detail_id INTEGER REFERENCES customer_detail(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);

-- ============================================
-- TABLE: guest_order
-- Used in: Checkout.tsx, TrackOrder.tsx, AdminPage.tsx, queries.ts
-- Operations: SELECT, INSERT
-- ============================================
CREATE TABLE guest_order (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for order lookups
CREATE INDEX idx_guest_order_order_id ON guest_order(order_id);
CREATE INDEX idx_guest_order_email ON guest_order(customer_email);

-- ============================================
-- TABLE: user_addresses
-- Used in: Checkout.tsx
-- Operations: SELECT, UPSERT
-- ============================================
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

-- ============================================
-- TABLE: reviews
-- Used in: ReviewSection.tsx, reviewQueries.ts, ProductDetail.tsx
-- Operations: SELECT, INSERT, UPDATE, DELETE
-- ============================================
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT,
    owner_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Indexes for review queries
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- TABLE: contact_submissions (optional)
-- Used in: Contact.tsx
-- Operations: INSERT
-- ============================================
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RPC FUNCTION: add_to_cart
-- Used in: cart.ts (Line 128)
-- ============================================
CREATE OR REPLACE FUNCTION add_to_cart(p_product_id INTEGER, p_qty INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (auth.uid(), p_product_id, p_qty)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
        quantity = cart_items.quantity + p_qty,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC FUNCTION: can_user_review_product
-- Used in: reviewQueries.ts (Line 27)
-- ============================================
CREATE OR REPLACE FUNCTION can_user_review_product(p_user_id UUID, p_product_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    has_delivered_order BOOLEAN := FALSE;
BEGIN
    -- Check if user has any delivered orders containing this product
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
    
    RETURN has_delivered_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC FUNCTION: get_product_reviews
-- Used in: reviewQueries.ts (Line 66)
-- ============================================
CREATE OR REPLACE FUNCTION get_product_reviews(p_product_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    rating INTEGER,
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    user_email TEXT,
    owner_reply TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.rating,
        r.comment,
        r.image_url,
        r.created_at,
        COALESCE(NULLIF(TRIM(p.first_name || ' ' || p.last_name), ''), 'Anonymous')::TEXT as user_name,
        COALESCE(p.email, '')::TEXT as user_email,
        r.owner_reply
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    WHERE r.product_id = p_product_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC FUNCTION: get_product_average_rating
-- Used in: productRatingHooks.ts (Line 32)
-- ============================================
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

-- ============================================
-- RPC FUNCTION: get_product_review_count
-- Used in: productRatingHooks.ts (Line 33)
-- ============================================
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

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on reviews table
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

-- Policy: Product owners can reply to reviews on their products
CREATE POLICY "Product owners can reply to reviews" ON reviews
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = reviews.product_id 
            AND products.product_owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = reviews.product_id 
            AND products.product_owner_id = auth.uid()
        )
    );

-- Enable RLS on cart_items table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cart items
CREATE POLICY "Users can view own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only modify their own cart items
CREATE POLICY "Users can modify own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample categories
INSERT INTO categories (id, name, slug) VALUES
    (uuid_generate_v4(), 'Fresh Mushrooms', 'fresh-mushrooms'),
    (uuid_generate_v4(), 'Dried Mushrooms', 'dried-mushrooms'),
    (uuid_generate_v4(), 'Mushroom Kits', 'mushroom-kits'),
    (uuid_generate_v4(), 'Supplements', 'supplements');

-- Note: Add sample products, users, etc. as needed for testing

-- ============================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true);

-- Storage policies for review images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- TRIGGERS (Optional - for updated_at)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Verification queries (optional)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Add Product_Owner_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS Product_Owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add Owner_reply to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS Owner_reply TEXT;
ALTER TABLE products
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Optional: Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
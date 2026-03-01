-- Policy: Product owners can update owner_reply for their product's reviews
CREATE POLICY "Product owners can update owner reply" ON reviews
FOR UPDATE USING (
    EXISTS (
        SELECT 1
        FROM products
        WHERE id = reviews.product_id
        AND product_owner_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1
        FROM products
        WHERE id = reviews.product_id
        AND product_owner_id = auth.uid()
    )
);
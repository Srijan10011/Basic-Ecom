-- Create function to get product reviews with user details
CREATE OR REPLACE FUNCTION get_product_reviews(p_product_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    rating INTEGER,
    comment TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    user_email TEXT,
    owner_reply TEXT -- Added owner_reply
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
        COALESCE(au.email, '')::TEXT as user_email,
        r.owner_reply -- Added owner_reply
    FROM reviews r
    LEFT JOIN profiles p ON r.user_id = p.id
    LEFT JOIN auth.users au ON r.user_id = au.id
    WHERE r.product_id = p_product_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
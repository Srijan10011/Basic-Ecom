# Web-Bolt - Detailed Component Flow Documentation
## Complete User Action → Code → Database Mapping

---

## TABLE OF CONTENTS
1. [Shop Page - Product Browsing](#1-shop-page---product-browsing)
2. [Product Detail Page](#2-product-detail-page)
3. [Cart Operations](#3-cart-operations)
4. [Checkout Process](#4-checkout-process)
5. [User Authentication](#5-user-authentication)
6. [Profile Management](#6-profile-management)
7. [Review System](#7-review-system)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Order Tracking](#9-order-tracking)

---

## 1. SHOP PAGE - PRODUCT BROWSING

### Flow: User Opens Shop Page

**User Action:** Click "Shop" in navigation

**Code Flow:**

1. **Header.tsx** (Line 89-95)
   ```typescript
   <button onClick={() => setCurrentPage('shop')}>Shop</button>
   ```
   - Triggers: `setCurrentPage('shop')`

2. **App.tsx** (Line 267-274)
   ```typescript
   case 'shop':
     return (
       <div>
         <Header ... />
         <Shop setCurrentPage={setCurrentPage} setSelectedProductId={setSelectedProductId} addToCart={addToCart} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `Shop` component

3. **Shop.tsx** (Line 82-91)
   ```typescript
   const { 
     data: products = [], 
     isLoading: loading, 
     error, 
     refetch 
   } = useProductsQuery();
   ```
   - Calls: `useProductsQuery()` hook

4. **lib/utils.ts** (Line 186-203)
   ```typescript
   export const useProductsQuery = () => {
     return useQuery({
       queryKey: ["products"],
       queryFn: async () => {
         const { data, error } = await supabase.from("products").select("*, categories(id, name)");
         if (error) {
           throw error;
         }
         return data;
       },
       ...
     });
   };
   ```
   - Executes: Supabase query

5. **lib/supabaseClient.ts** (Line 73-85)
   ```typescript
   export const supabase: SupabaseClient = hasValidConfig 
     ? createClient(supabaseUrl, supabaseAnonKey, {
         auth: { ... },
         db: { schema: 'public' },
         ...
       })
     : createMockClient();
   ```
   - Connects to: Supabase PostgreSQL

6. **Database Query:**
   ```sql
   SELECT products.*, categories.id, categories.name 
   FROM products 
   LEFT JOIN categories ON products.category_id = categories.id
   ```
   - Tables: `products`, `categories`

7. **Shop.tsx** (Line 93-103)
   ```typescript
   const productIds = useMemo(() => products.map(p => p.id), [products]);
   
   const { 
     data: productRatings = [], 
     isLoading: ratingsLoading 
   } = useProductsRatingsQuery(productIds);
   ```
   - Fetches: Product ratings for all products

8. **lib/productRatingHooks.ts** (Line 24-48)
   ```typescript
   export const useProductsRatingsQuery = (productIds: number[]) => {
     return useQuery({
       queryKey: ['productsRatings', productIds],
       queryFn: async () => {
         const ratings = await Promise.all(
           productIds.map(async (id) => {
             const [avgResult, countResult] = await Promise.all([
               supabase.rpc('get_product_average_rating', { p_product_id: id }),
               supabase.rpc('get_product_review_count', { p_product_id: id })
             ]);
             ...
           })
         );
         return ratings;
       },
       ...
     });
   };
   ```
   - Calls: Database RPC functions

9. **Database Functions:**
   ```sql
   -- database-setup.sql (Line 145-156)
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
   ```
   - Tables: `reviews`

10. **Shop.tsx** (Line 105-112)
    ```typescript
    const ratingsMap = useMemo(() => {
      const map = new Map();
      productRatings.forEach(rating => {
        map.set(rating.productId, rating);
      });
      return map;
    }, [productRatings]);
    ```
    - Creates: Rating lookup map

11. **Shop.tsx** (Line 398-408)
    ```typescript
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
      {filteredAndSortedProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          rating={ratingsMap.get(product.id)}
          onProductClick={(id) => {
            setSelectedProductId(id);
            setCurrentPage('product-detail');
          }} 
          addToCart={addToCart} 
        />
      ))}
    </div>
    ```
    - Renders: Product cards with ratings

---

### Flow: User Searches/Filters Products

**User Action:** Type in search box or select filters

**Code Flow:**

1. **Shop.tsx** (Line 233-244)
   ```typescript
   <input
     type="text"
     placeholder="Search products..."
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     className="..."
   />
   ```
   - Updates: `searchQuery` state

2. **Shop.tsx** (Line 247-257)
   ```typescript
   <select
     value={selectedCategory}
     onChange={(e) => setSelectedCategory(e.target.value)}
     className="..."
   >
     {categories.map((category) => (
       <option key={category.id} value={category.id}>
         {category.name}
       </option>
     ))}
   </select>
   ```
   - Updates: `selectedCategory` state

3. **Shop.tsx** (Line 138-180)
   ```typescript
   const filteredAndSortedProducts = useMemo(() => {
     let filtered = products;

     // Filter by search query
     if (searchQuery) {
       filtered = filtered.filter(product =>
         product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         product.description.toLowerCase().includes(searchQuery.toLowerCase())
       );
     }

     // Filter by category
     if (selectedCategory !== 'all') {
       filtered = filtered.filter((product) => {
         const categoryId = (product as any).category_id as string | undefined;
         if (categoryId) return categoryId === selectedCategory;
         ...
       });
     }

     // Filter by price range
     if (priceRange !== 'all') {
       filtered = filtered.filter(product => {
         const price = product.price;
         switch (priceRange) {
           case 'under-20': return price < 20;
           case '20-50': return price >= 20 && price <= 50;
           case 'over-50': return price > 50;
           default: return true;
         }
       });
     }

     // Sort products
     filtered.sort((a, b) => {
       switch (sortBy) {
         case 'price-asc': return a.price - b.price;
         case 'price-desc': return b.price - a.price;
         case 'rating': {
           const aRating = ratingsMap.get(a.id)?.averageRating || 0;
           const bRating = ratingsMap.get(b.id)?.averageRating || 0;
           return bRating - aRating;
         }
         case 'name':
         default: return a.name.localeCompare(b.name);
       }
     });

     return filtered;
   }, [products, searchQuery, selectedCategory, sortBy, priceRange]);
   ```
   - Filters/Sorts: Products in memory (no DB query)
   - Re-renders: Product grid

---

### Flow: User Clicks "Add to Cart" on Product Card

**User Action:** Click "Add to Cart" button

**Code Flow:**

1. **Shop.tsx** (Line 67-73)
   ```typescript
   <button 
     onClick={() => addToCart(product)}
     className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 text-xs sm:text-base"
   >
     Add to Cart
   </button>
   ```
   - Calls: `addToCart(product)` from props

2. **App.tsx** (Line 109-124)
   ```typescript
   const addToCart = async (product: any) => {
     if (session?.user) {
       await addItemToUserCart(session.user.id, product.id, 1);
       await refetchCart();
     } else {
       const items = [...cart];
       const found = items.find(i => i.id === product.id);
       if (found) {
         found.quantity += 1;
       } else {
         items.push({ ...product, quantity: 1 });
       }
       saveGuestCart(items);
       setCart(items);
     }
   };
   ```
   - Branches: Authenticated vs Guest user

**For Authenticated Users:**

3. **lib/cart.ts** (Line 115-149)
   ```typescript
   export async function addItemToUserCart(_userId: string, productId: number, quantityDelta: number = 1): Promise<void> {
     console.groupCollapsed('[Cart][User] addItemToUserCart');
     console.log('Input', { productId, quantityDelta, note: 'userId is enforced via RLS inside RPC' });
     
     const payload = { p_product_id: productId, p_qty: Math.max(1, quantityDelta) };
     console.log('RPC call add_to_cart with', payload);
     
     const rpcRes: any = await withAuthRetry(() => supabase.rpc('add_to_cart', payload), 'rpc add_to_cart');
     const { data, error } = rpcRes;
     
     if (error) {
       console.error('[Cart][User] addItemToUserCart: RPC returned error after retry', error);
       console.groupEnd();
       throw error;
     }
     ...
   }
   ```
   - Calls: `supabase.rpc('add_to_cart', ...)`

4. **Database RPC Function:**
   ```sql
   -- This function should exist in your database (not in provided files)
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
   ```
   - Tables: `cart_items` (INSERT/UPDATE)

5. **lib/cart.ts** (Line 151-167)
   ```typescript
   // Verification: read back the row for this user/product
   try {
     console.log('[Cart][User] addItemToUserCart: verifying row exists for user/product', { userId: _userId, productId });
     const verifyRes: any = await withAuthRetry(() =>
       supabase
         .from('cart_items')
         .select('user_id, product_id, quantity, updated_at')
         .eq('user_id', _userId)
         .eq('product_id', productId)
         .order('updated_at', { ascending: false })
         .limit(1)
     , 'verification select');
     ...
   }
   ```
   - Verifies: Cart item was added

6. **App.tsx** (Line 111)
   ```typescript
   await refetchCart();
   ```
   - Calls: `refetchCart()` to update UI

7. **App.tsx** (Line 100-107)
   ```typescript
   const refetchCart = async () => {
     if (session?.user) {
       const items = await fetchUserCart(session.user.id);
       setCart(items);
     } else {
       setCart(loadGuestCart());
     }
   };
   ```
   - Calls: `fetchUserCart()`

8. **lib/cart.ts** (Line 75-113)
   ```typescript
   export async function fetchUserCart(userId: string): Promise<UiCartItem[]> {
     console.log('[Cart][User] fetchUserCart: start', { userId });
     
     // Fetch cart rows first
     const cartRes: any = await withAuthRetry(() =>
       supabase
         .from('cart_items')
         .select('product_id, quantity')
         .eq('user_id', userId)
     , 'fetchUserCart/select');
     
     const { data: rows, error: cartError } = cartRes;
     ...
     
     const productIds = Array.from(new Set(rows.map((r: any) => r.product_id)));
     
     const { data: products, error: prodError } = await supabase
       .from('products')
       .select('id, name, price, image')
       .in('id', productIds);
     ...
   }
   ```
   - Tables: `cart_items` (SELECT), `products` (SELECT)

**For Guest Users:**

3. **lib/cart.ts** (Line 46-56)
   ```typescript
   export function loadGuestCart(): UiCartItem[] {
     try {
       console.log('[Cart][Guest] loadGuestCart: reading from localStorage');
       const raw = localStorage.getItem(GUEST_CART_KEY);
       if (!raw) {
         console.log('[Cart][Guest] loadGuestCart: no data found');
         return [];
       }
       const parsed = JSON.parse(raw);
       ...
       return parsed as UiCartItem[];
     } catch {
       ...
     }
   }
   ```
   - Storage: localStorage (browser)

4. **lib/cart.ts** (Line 58-65)
   ```typescript
   export function saveGuestCart(items: UiCartItem[]): void {
     try {
       console.log('[Cart][Guest] saveGuestCart: writing items', items);
       localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
     } catch {
       // no-op
     }
   }
   ```
   - Storage: localStorage (browser)

---


## 2. PRODUCT DETAIL PAGE

### Flow: User Clicks on Product Card

**User Action:** Click on product image or name

**Code Flow:**

1. **Shop.tsx** (Line 48-54)
   ```typescript
   <button onClick={() => onProductClick(product.id)} className="w-full h-full">
     <img 
       src={product.image} 
       alt={product.name}
       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
     />
   </button>
   ```
   - Calls: `onProductClick(product.id)`

2. **Shop.tsx** (Line 402-405)
   ```typescript
   onProductClick={(id) => {
     setSelectedProductId(id);
     setCurrentPage('product-detail');
   }}
   ```
   - Updates: `selectedProductId` state
   - Changes: Page to 'product-detail'

3. **App.tsx** (Line 276-283)
   ```typescript
   case 'product-detail':
     return (
       <div>
         <Header ... />
         <ProductDetail productId={selectedProductId} setCurrentPage={setCurrentPage} addToCart={addToCart} session={session} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `ProductDetail` component with `productId`

4. **ProductDetail.tsx** (Line 28-37)
   ```typescript
   const { 
     data: product, 
     isLoading: productLoading, 
     error: productError,
     refetch: refetchProduct 
   } = useProductQuery(productId);
   ```
   - Calls: `useProductQuery(productId)` hook

5. **lib/utils.ts** (Line 223-241)
   ```typescript
   export const useProductQuery = (productId: number | null) => {
     return useQuery({
       queryKey: ["product", productId],
       queryFn: async () => {
         if (!productId) throw new Error("No product ID provided");
         const { data, error } = await supabase
           .from("products")
           .select("*, categories(id, name), product_owner_id")
           .eq("id", productId)
           .single();
         if (error) throw error;
         return data;
       },
       enabled: !!productId,
       ...
     });
   };
   ```
   - Executes: Supabase query

6. **Database Query:**
   ```sql
   SELECT 
     products.*,
     categories.id,
     categories.name,
     products.product_owner_id
   FROM products
   LEFT JOIN categories ON products.category_id = categories.id
   WHERE products.id = $1
   LIMIT 1
   ```
   - Tables: `products`, `categories`

7. **ProductDetail.tsx** (Line 145-152)
   ```typescript
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
       <ReviewSection 
         productId={product.id} 
         userId={session?.user?.id}
       />
     </div>
   </div>
   ```
   - Renders: `ReviewSection` component

8. **ReviewSection.tsx** (Line 237-240)
   ```typescript
   const { data: product, isLoading: productLoading } = useProductQuery(productId);
   const isProductOwner = userId && product?.product_owner_id === userId;
   
   const { data: canReview = false, isLoading: canReviewLoading } = useCanUserReviewQuery(userId, productId);
   ```
   - Checks: If user can review product

9. **lib/reviewQueries.ts** (Line 19-35)
   ```typescript
   export const useCanUserReviewQuery = (userId: string | undefined, productId: number | null) => {
     return useQuery({
       queryKey: ['canUserReview', userId, productId],
       queryFn: async () => {
         if (!userId || !productId) return false;
         
         const { data, error } = await supabase.rpc('can_user_review_product', {
           p_user_id: userId,
           p_product_id: productId
         });
         
         if (error) throw error;
         return data;
       },
       enabled: !!userId && !!productId,
       staleTime: 5 * 60 * 1000,
       });
   };
   ```
   - Calls: Database RPC function

10. **Database Function:**
    ```sql
    -- database-setup.sql (Line 88-111)
    CREATE OR REPLACE FUNCTION can_user_review_product(p_user_id UUID, p_product_id INTEGER)
    RETURNS BOOLEAN AS $$
    DECLARE
        has_delivered_order BOOLEAN := FALSE;
    BEGIN
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
    ```
    - Tables: `orders` (checks for delivered orders with product)

---

## 3. CART OPERATIONS

### Flow: User Opens Cart

**User Action:** Click cart icon in header

**Code Flow:**

1. **Header.tsx** (Line 145-158)
   ```typescript
   <button
     onClick={() => setCurrentPage('cart')}
     className="relative p-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
   >
     <ShoppingCart className="h-6 w-6" />
     {cart.length > 0 && (
       <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
         {cart.length}
       </span>
     )}
   </button>
   ```
   - Changes: Page to 'cart'

2. **App.tsx** (Line 300-307)
   ```typescript
   case 'cart':
     return (
       <div>
         <Header ... />
         <Cart cart={cart} setCurrentPage={setCurrentPage} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `Cart` component with cart state

3. **Cart.tsx** (Line 15-50)
   ```typescript
   export default function Cart({ cart, setCurrentPage, updateCartQuantity, removeFromCart, clearCart }: CartProps) {
     const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
     // Displays cart items from state
   }
   ```
   - Displays: Cart items from state

### Flow: User Updates Cart Quantity

**User Action:** Click +/- buttons

**Code Flow:**

1. **Cart.tsx** (Line 30-42)
   ```typescript
   <button 
     onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
     className="..."
   >
     -
   </button>
   ```
   - Calls: `updateCartQuantity(item.id, newQuantity)`

2. **App.tsx** (Line 126-138)
   ```typescript
   const updateCartQuantity = async (productId: number, quantity: number) => {
     if (session?.user) {
       await setItemQuantityInUserCart(session.user.id, productId, quantity);
       await refetchCart();
     } else {
       let items;
       if (quantity <= 0) {
         items = cart.filter(i => i.id !== productId);
       } else {
         items = cart.map(i => i.id === productId ? { ...i, quantity } : i);
       }
       saveGuestCart(items);
       setCart(items);
     }
   };
   ```
   - Branches: Authenticated vs Guest

**For Authenticated Users:**

3. **lib/cart.ts** (Line 169-186)
   ```typescript
   export async function setItemQuantityInUserCart(userId: string, productId: number, quantity: number): Promise<void> {
     if (quantity <= 0) {
       await removeItemFromUserCart(userId, productId);
       return;
     }
     const upsertRes: any = await withAuthRetry(() =>
       supabase
         .from('cart_items')
         .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' })
     , 'upsert cart_items');
   }
   ```
   - Tables: `cart_items` (UPSERT)

4. **Database Query:**
   ```sql
   INSERT INTO cart_items (user_id, product_id, quantity)
   VALUES ($1, $2, $3)
   ON CONFLICT (user_id, product_id)
   DO UPDATE SET 
     quantity = $3,
     updated_at = NOW()
   ```
   - Tables: `cart_items` (UPDATE)

---

## 4. CHECKOUT PROCESS

### Flow: User Proceeds to Checkout

**User Action:** Click "Proceed to Checkout" in cart

**Code Flow:**

1. **Cart.tsx** (Line 85-90)
   ```typescript
   <button 
     onClick={() => setCurrentPage('checkout')}
     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors"
   >
     Proceed to Checkout
   </button>
   ```
   - Changes: Page to 'checkout'

2. **App.tsx** (Line 309-316)
   ```typescript
   case 'checkout':
     return (
       <div>
         <Header ... />
         <Checkout cart={cart} setCurrentPage={setCurrentPage} session={session} clearCart={clearCart} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `Checkout` component

3. **Checkout.tsx** (Line 40-56)
   ```typescript
   const { 
     data: profile, 
     isLoading: profileLoading, 
     error: profileError,
     refetch: refetchProfile 
   } = useProfileQuery(user?.id);

   const { 
     data: addressData, 
     isLoading: addressLoading, 
     error: addressError,
     refetch: refetchAddress 
   } = useUserAddressesQuery(user?.id);
   ```
   - Fetches: User profile and saved address

4. **lib/utils.ts** (Line 244-262)
   ```typescript
   export const useProfileQuery = (userId: string | undefined) => {
     return useQuery({
       queryKey: ["profile", userId],
       queryFn: async () => {
         if (!userId) throw new Error("No user ID provided");
         const { data, error } = await supabase
           .from("profiles")
           .select("first_name, last_name, email, role")
           .eq("id", userId)
           .single();
         if (error) throw error;
         return data;
       },
       enabled: !!userId,
       ...
     });
   };
   ```
   - Tables: `profiles` (SELECT)

5. **lib/utils.ts** (Line 298-316)
   ```typescript
   export const useUserAddressesQuery = (userId: string | undefined) => {
     return useQuery({
       queryKey: ["userAddresses", userId],
       queryFn: async () => {
         if (!userId) throw new Error("No user ID provided");
         const { data, error } = await supabase
           .from("user_addresses")
           .select("phone, address, city, state, zip_code, latitude, longitude")
           .eq("user_id", userId)
           .single();
         if (error && error.code !== "PGRST116") throw error;
         return data;
       },
       enabled: !!userId,
       ...
     });
   };
   ```
   - Tables: `user_addresses` (SELECT)

6. **Checkout.tsx** (Line 72-82)
   ```typescript
   useEffect(() => {
     if (profile) {
       setFirstName(profile.first_name || '');
       setLastName(profile.last_name || '');
       setEmail(profile.email || '');
     } else if (session?.user) {
       setFirstName(session.user.user_metadata?.first_name || '');
       setLastName(session.user.user_metadata?.last_name || '');
       setEmail(session.user.email || '');
     }
   }, [profile, session]);
   ```
   - Pre-fills: Form with user data

### Flow: User Places Order

**User Action:** Click "Place Order" button

**Code Flow:**

1. **Checkout.tsx** (Line 127)
   ```typescript
   const handlePlaceOrder = async () => {
   ```
   - Starts: Order placement process

2. **Checkout.tsx** (Line 128-145)
   ```typescript
   console.log('=== ORDER PLACEMENT STARTED ===');
   console.log('Cart items:', cart);
   console.log('Form data:', { firstName, lastName, email, phone, address, city, state, location });

   // Step 1: Get user (optional for guest checkout)
   let currentUser = null;
   try {
     const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
     if (userError) {
       console.log('User not authenticated, proceeding as guest checkout');
     } else if (authUser) {
       currentUser = authUser;
       console.log('✓ User authenticated:', currentUser.id);
     }
   } catch (error) {
     console.log('Authentication check failed, proceeding as guest checkout');
   }
   ```
   - Checks: User authentication status

3. **Checkout.tsx** (Line 147-156)
   ```typescript
   // Step 2: Validate location
   if (!location) {
     alert('Please click "Use my location" to proceed with the order.');
     return;
   }

   // Step 3: Validate required fields
   if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
     alert('Please fill in all required fields.');
     return;
   }
   ```
   - Validates: Form data

4. **Checkout.tsx** (Line 158-171)
   ```typescript
   const shippingAddress = {
     firstName,
     lastName,
     email,
     phone,
     address,
     city,
     state,
     zipCode: '',
     latitude: location ? parseFloat(location.split(', ')[0]) : null,
     longitude: location ? parseFloat(location.split(', ')[1]) : null,
   };
   ```
   - Prepares: Shipping address object

**For Authenticated Users:**

5. **Checkout.tsx** (Line 173-189)
   ```typescript
   if (currentUser) {
     console.log('Step 4: Saving user address...');
     const { error: upsertError } = await supabase
       .from('user_addresses')
       .upsert({
         user_id: currentUser.id,
         phone,
         address,
         city,
         state,
         zip_code: '',
         latitude: shippingAddress.latitude,
         longitude: shippingAddress.longitude,
       }, { onConflict: 'user_id' });

     if (upsertError) {
       console.error('❌ Address save failed:', upsertError);
       alert(`Failed to save address: ${upsertError.message}`);
       return;
     }
   }
   ```
   - Tables: `user_addresses` (UPSERT)

6. **Checkout.tsx** (Line 192-217)
   ```typescript
   const totalWithShipping = totalPrice + 5.99;
   const cartItems = cart;

   const orderData: any = {
     order_number: `ORD-${Date.now()}`,
     total_amount: totalWithShipping.toFixed(2),
     status: 'pending',
     order_date: new Date().toISOString(),
     user_id: currentUser?.id || null,
     items: cartItems.map(item => ({
       id: item.id,
       name: item.name,
       quantity: item.quantity,
       price: item.price,
     })),
   };

   const customerInfo = {
     customer_name: `${firstName} ${lastName}`.trim() || 'Guest',
     shipping_address: {
       phone: formData.phone,
       address: formData.address,
       city: formData.city,
       state: formData.state,
       zipCode: formData.zipCode,
       latitude: coordinates.lat,
       longitude: coordinates.lng
     }
   };
   ```
   - Prepares: Order data

**For Authenticated Users:**

7. **Checkout.tsx** (Line 234-250)
   ```typescript
   if (currentUser) {
     const customerDetailData = {
       user_id: currentUser.id,
       ...customerInfo
     };

     const { data: customerDetail, error: customerError } = await supabase
       .from('customer_detail')
       .insert([customerDetailData])
       .select()
       .single();

     if (customerError) {
       console.error('❌ Customer detail insert failed:', customerError);
       alert(`Failed to create customer details: ${customerError.message}`);
       return;
     }

     orderData.customer_detail_id = customerDetail.id;
   }
   ```
   - Tables: `customer_detail` (INSERT)

8. **Checkout.tsx** (Line 253-260)
   ```typescript
   let { data, error } = await supabase
     .from('orders')
     .insert([orderData])
     .select();

   if (error) {
     console.error('❌ Order insert failed:', error);
     alert(`Failed to place order: ${error.message}`);
     return;
   }
   ```
   - Tables: `orders` (INSERT)

9. **Database Query:**
   ```sql
   INSERT INTO orders (
     order_number,
     user_id,
     customer_detail_id,
     total_amount,
     status,
     order_date,
     items
   ) VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *
   ```
   - Tables: `orders` (INSERT)

**For Guest Users:**

10. **Checkout.tsx** (Line 283-301)
    ```typescript
    if (!currentUser && data && data.length > 0) {
      const guestOrderData = {
        order_id: data[0].id,
        customer_name: customerInfo.customer_name,
        shipping_address: customerInfo.shipping_address,
        customer_email: email,
        created_at: new Date().toISOString()
      };

      const { error: guestOrderError } = await supabase
        .from('guest_order')
        .insert([guestOrderData]);

      if (guestOrderError) {
        console.error('❌ Guest order details insert failed:', guestOrderError);
      } else {
        console.log('✓ Guest order details created successfully');
      }
    }
    ```
    - Tables: `guest_order` (INSERT)

11. **Checkout.tsx** (Line 304-309)
    ```typescript
    if (currentUser && typeof window !== 'undefined' && (window as any).queryClient) {
      console.log('Invalidating user orders cache for user:', currentUser.id);
      (window as any).queryClient.invalidateQueries(['userOrders', currentUser.id]);
    }
    ```
    - Invalidates: React Query cache for orders

12. **Checkout.tsx** (Line 312-332)
    ```typescript
    if (!currentUser) {
      const guestSession: GuestSession = {
        orderId: data[0].id,
        orderNumber: orderData.order_number,
        customerEmail: email,
        customerName: `${firstName} ${lastName}`,
        orderData: {
          ...orderData,
          id: data[0].id
        }
      };

      const existingSessions = JSON.parse(localStorage.getItem('guestSessions') || '[]');
      existingSessions.push(guestSession);
      localStorage.setItem('guestSessions', JSON.stringify(existingSessions));

      const guestContactInfo = { firstName, lastName, email, phone };
      localStorage.setItem('guestContactInfo', JSON.stringify(guestContactInfo));
    }
    ```
    - Storage: localStorage (guest session)

13. **Checkout.tsx** (Line 340-341)
    ```typescript
    await clearCart();
    setCurrentPage('home');
    ```
    - Clears: Cart and redirects to home

14. **App.tsx** (Line 151-159)
    ```typescript
    const clearCart = async () => {
      if (session?.user) {
        await clearUserCart(session.user.id);
        await refetchCart();
      } else {
        clearGuestCart();
        setCart([]);
      }
    };
    ```
    - Calls: `clearUserCart()` or `clearGuestCart()`

15. **lib/cart.ts** (Line 202-214)
    ```typescript
    export async function clearUserCart(userId: string): Promise<void> {
      console.log('[Cart][User] clearUserCart: start', { userId });
      const clearRes: any = await withAuthRetry(() =>
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
      , 'clear cart_items');
      const { data, error } = clearRes;
      if (error) {
        console.error('[Cart][User] clearUserCart: delete failed', error);
        throw error;
      }
    }
    ```
    - Tables: `cart_items` (DELETE all for user)

16. **Database Query:**
    ```sql
    DELETE FROM cart_items
    WHERE user_id = $1
    ```
    - Tables: `cart_items` (DELETE)

---


## 5. USER AUTHENTICATION

### Flow: User Signs Up

**User Action:** Click "Sign Up" button in header

**Code Flow:**

1. **Header.tsx** (Line 120-125)
   ```typescript
   <button
     onClick={() => setModal('signup')}
     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
   >
     Sign Up
   </button>
   ```
   - Opens: Signup modal

2. **App.tsx** (Line 356-357)
   ```typescript
   {modal === 'signup' && <Signup setModal={setModal} />}
   ```
   - Renders: `Signup` component

3. **Signup.tsx** (Line 15-25)
   ```typescript
   const handleSignup = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     if (password !== confirmPassword) {
       setError('Passwords do not match');
       setLoading(false);
       return;
     }
   ```
   - Validates: Password match

4. **Signup.tsx** (Line 27-38)
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: {
         first_name: firstName,
         last_name: lastName,
       }
     }
   });

   if (error) throw error;
   ```
   - Calls: Supabase Auth API

5. **Supabase Auth:**
   - Creates: User in `auth.users` table
   - Sends: Confirmation email (if enabled)

6. **Signup.tsx** (Line 40-51)
   ```typescript
   if (data.user) {
     const { error: profileError } = await supabase
       .from('profiles')
       .insert([
         {
           id: data.user.id,
           first_name: firstName,
           last_name: lastName,
           email: email,
           role: 'user'
         }
       ]);
   ```
   - Tables: `profiles` (INSERT)

7. **Database Query:**
   ```sql
   INSERT INTO profiles (id, first_name, last_name, email, role)
   VALUES ($1, $2, $3, $4, 'user')
   ```
   - Tables: `profiles` (INSERT)

### Flow: User Logs In

**User Action:** Click "Login" button

**Code Flow:**

1. **Header.tsx** (Line 113-118)
   ```typescript
   <button
     onClick={() => setModal('login')}
     className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 px-4 py-2 rounded-lg font-semibold transition-colors"
   >
     Login
   </button>
   ```
   - Opens: Login modal

2. **App.tsx** (Line 355)
   ```typescript
   {modal === 'login' && <Login setModal={setModal} />}
   ```
   - Renders: `Login` component

3. **Login.tsx** (Line 13-23)
   ```typescript
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       const { data, error } = await supabase.auth.signInWithPassword({
         email,
         password,
       });
   ```
   - Calls: Supabase Auth API

4. **Supabase Auth:**
   - Validates: Credentials against `auth.users`
   - Creates: Session token
   - Stores: Session in localStorage

5. **Login.tsx** (Line 25-30)
   ```typescript
   if (error) throw error;

   if (data.session) {
     setModal(null);
     window.location.reload();
   }
   ```
   - Closes: Modal and reloads page

6. **App.tsx** (Line 161-189)
   ```typescript
   useEffect(() => {
     let mounted = true;

     const initializeApp = async () => {
       try {
         await checkDatabaseConnection();

         const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
         
         if (sessionError) {
           console.error('Error getting initial session:', sessionError);
         } else if (mounted) {
           setSession(initialSession);
         }

         const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
           if (mounted) {
             setSession(session);
             await refetchCart();
           }
         });

         if (mounted) {
           await refetchCart();
           setIsLoading(false);
         }

         return () => subscription.unsubscribe();
       } catch (error) {
         console.error('Error initializing app:', error);
       }
     };

     initializeApp();
   }, []);
   ```
   - Sets up: Auth state listener
   - Fetches: User cart after login

---

## 6. PROFILE MANAGEMENT

### Flow: User Views Profile

**User Action:** Click profile icon in header

**Code Flow:**

1. **Header.tsx** (Line 160-170)
   ```typescript
   <button
     onClick={() => setCurrentPage('profile')}
     className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
   >
     <User className="h-6 w-6" />
     <span className="hidden md:inline">Profile</span>
   </button>
   ```
   - Changes: Page to 'profile'

2. **App.tsx** (Line 285-292)
   ```typescript
   case 'profile':
     return (
       <div>
         <Header ... />
         <Profile session={session} setCurrentPage={setCurrentPage} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `Profile` component

3. **Profile.tsx** (Line 15-24)
   ```typescript
   const {
     data: profile,
     isLoading: profileLoading,
     error: profileError,
     refetch: refetchProfile,
   } = useProfileQuery(session?.user?.id);
   ```
   - Fetches: User profile

4. **lib/utils.ts** (Line 244-262)
   ```typescript
   export const useProfileQuery = (userId: string | undefined) => {
     return useQuery({
       queryKey: ["profile", userId],
       queryFn: async () => {
         if (!userId) throw new Error("No user ID provided");
         const { data, error } = await supabase
           .from("profiles")
           .select("first_name, last_name, email, role")
           .eq("id", userId)
           .single();
         if (error) throw error;
         return data;
       },
       enabled: !!userId,
       ...
     });
   };
   ```
   - Tables: `profiles` (SELECT)

5. **Profile.tsx** (Line 26-35)
   ```typescript
   const {
     data: orders = [],
     isLoading: ordersLoading,
     error: ordersError,
     refetch: refetchOrders,
   } = useUserOrdersQuery(session?.user?.id);
   ```
   - Fetches: User orders

6. **lib/utils.ts** (Line 265-295)
   ```typescript
   export const useUserOrdersQuery = (userId: string | undefined) => {
     return useQuery({
       queryKey: ["userOrders", userId],
       queryFn: async () => {
         if (!userId) throw new Error("No user ID provided");

         const { data, error } = await supabase
           .from("orders")
           .select(`
             *,
             customer_detail!inner(
               customer_name,
               shipping_address
             )
           `)
           .eq("user_id", userId)
           .order("order_date", { ascending: false });

         if (error) {
           console.error("Supabase error details:", error);
           throw error;
         }

         return data || [];
       },
       enabled: !!userId,
       ...
     });
   };
   ```
   - Tables: `orders`, `customer_detail` (JOIN)

7. **Database Query:**
   ```sql
   SELECT 
     orders.*,
     customer_detail.customer_name,
     customer_detail.shipping_address
   FROM orders
   INNER JOIN customer_detail ON orders.customer_detail_id = customer_detail.id
   WHERE orders.user_id = $1
   ORDER BY orders.order_date DESC
   ```
   - Tables: `orders`, `customer_detail`

8. **Profile.tsx** (Line 145-147)
   ```typescript
   <OrderTabs orders={orders} />
   ```
   - Renders: Order tabs component

9. **OrderTabs.tsx** (Line 15-50)
   ```typescript
   export default function OrderTabs({ orders }: OrderTabsProps) {
     const [activeTab, setActiveTab] = useState<OrderStatus>('all');

     const filteredOrders = useMemo(() => {
       if (activeTab === 'all') return orders;
       return orders.filter(order => order.status === activeTab);
     }, [orders, activeTab]);

     return (
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
         <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus)}>
           <TabsList className="grid w-full grid-cols-5">
             <TabsTrigger value="all">All</TabsTrigger>
             <TabsTrigger value="pending">Pending</TabsTrigger>
             <TabsTrigger value="processing">Processing</TabsTrigger>
             <TabsTrigger value="shipped">Shipped</TabsTrigger>
             <TabsTrigger value="delivered">Delivered</TabsTrigger>
           </TabsList>
           ...
         </Tabs>
       </div>
     );
   }
   ```
   - Filters: Orders by status

### Flow: User Updates Profile

**User Action:** Click "Edit Profile" button

**Code Flow:**

1. **Profile.tsx** (Line 151-156)
   ```typescript
   <button
     onClick={() => setCurrentPage('update-profile')}
     className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
   >
     Edit Profile
   </button>
   ```
   - Changes: Page to 'update-profile'

2. **App.tsx** (Line 294-301)
   ```typescript
   case 'update-profile':
     return (
       <div>
         <Header ... />
         <UpdateProfile setCurrentPage={setCurrentPage} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `UpdateProfile` component

3. **UpdateProfile.tsx** (Line 20-40)
   ```typescript
   useEffect(() => {
     async function loadProfile() {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         setUserId(user.id);
         const { data, error } = await supabase
           .from('profiles')
           .select('first_name, last_name, email')
           .eq('id', user.id)
           .single();

         if (error) {
           console.error('Error loading profile:', error);
         } else if (data) {
           setFirstName(data.first_name || '');
           setLastName(data.last_name || '');
           setEmail(data.email || '');
         }
       }
     }
     loadProfile();
   }, []);
   ```
   - Tables: `profiles` (SELECT)

4. **UpdateProfile.tsx** (Line 42-70)
   ```typescript
   const handleUpdateProfile = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       if (!userId) {
         throw new Error('User not authenticated');
       }

       const { error } = await supabase
         .from('profiles')
         .update({
           first_name: firstName,
           last_name: lastName,
           email: email,
         })
         .eq('id', userId);

       if (error) throw error;

       alert('Profile updated successfully!');
       setCurrentPage('profile');
     } catch (error: any) {
       console.error('Error updating profile:', error);
       setError(error.message || 'Failed to update profile');
     } finally {
       setLoading(false);
     }
   };
   ```
   - Tables: `profiles` (UPDATE)

5. **Database Query:**
   ```sql
   UPDATE profiles
   SET 
     first_name = $1,
     last_name = $2,
     email = $3
   WHERE id = $4
   ```
   - Tables: `profiles` (UPDATE)

---


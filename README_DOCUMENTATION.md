# Web-Bolt E-Commerce Platform - Complete Documentation Index

## 📚 Documentation Files

This codebase documentation is split into multiple files for better organization:

1. **DETAILED_FLOW_DOCUMENTATION.md** - Part 1
   - Shop Page - Product Browsing
   - Product Detail Page
   - Cart Operations
   - Checkout Process
   - User Authentication
   - Profile Management

2. **DETAILED_FLOW_PART2.md** - Part 2
   - Review System
   - Admin Dashboard
   - Order Tracking
   - Database Tables Summary
   - Architectural Patterns

---

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + shadcn/ui components
- **State Management:** React Query (TanStack Query v5)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Build Tool:** Vite

### Project Structure
```
Web-Bolt/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (shadcn)
│   │   ├── Shop.tsx        # Product listing page
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── AdminPage.tsx
│   │   ├── Profile.tsx
│   │   ├── ReviewSection.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ... (20+ components)
│   ├── lib/                # Utility libraries
│   │   ├── supabaseClient.ts    # Supabase config & client
│   │   ├── utils.ts             # React Query hooks
│   │   ├── cart.ts              # Cart operations
│   │   ├── reviewQueries.ts     # Review CRUD operations
│   │   ├── queries.ts           # Additional queries
│   │   └── productRatingHooks.ts
│   ├── pages/              # Page wrapper components
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── database-setup.sql      # Complete database schema
└── *.sql                   # Migration files
```

---

## 🗄️ Database Schema

### Core Tables

#### products
- **Purpose:** Store all product information
- **Key Columns:** id, name, description, price, image, category_id, product_owner_id, is_featured
- **Updated By:** AdminPage.tsx (INSERT, UPDATE)
- **Queried By:** Shop.tsx, ProductDetail.tsx, FeaturedProducts.tsx, Cart.tsx

#### categories
- **Purpose:** Product categorization
- **Key Columns:** id (UUID), name, slug
- **Updated By:** Admin operations
- **Queried By:** Shop.tsx, AdminPage.tsx

#### profiles
- **Purpose:** User profile information
- **Key Columns:** id (UUID), first_name, last_name, email, role
- **Updated By:** Signup.tsx (INSERT), UpdateProfile.tsx (UPDATE)
- **Queried By:** Profile.tsx, Header.tsx, AdminPage.tsx

#### cart_items
- **Purpose:** Shopping cart for authenticated users
- **Key Columns:** id, user_id, product_id, quantity
- **Constraint:** UNIQUE(user_id, product_id)
- **Updated By:** cart.ts functions (INSERT, UPDATE, DELETE)
- **Queried By:** App.tsx (fetchUserCart)

#### orders
- **Purpose:** Store all orders (guest + authenticated)
- **Key Columns:** id (UUID), order_number, user_id (nullable), customer_detail_id, total_amount, status, items (JSONB)
- **Updated By:** Checkout.tsx (INSERT), AdminPage.tsx (UPDATE status)
- **Queried By:** Profile.tsx, AdminPage.tsx, TrackOrder.tsx

#### customer_detail
- **Purpose:** Shipping info for authenticated users
- **Key Columns:** id, user_id, customer_name, shipping_address (JSONB)
- **Updated By:** Checkout.tsx (INSERT)
- **Queried By:** Profile.tsx, AdminPage.tsx

#### guest_order
- **Purpose:** Customer info for guest orders
- **Key Columns:** id, order_id, customer_name, customer_email, shipping_address (JSONB)
- **Updated By:** Checkout.tsx (INSERT)
- **Queried By:** TrackOrder.tsx, AdminPage.tsx

#### user_addresses
- **Purpose:** Saved addresses for users
- **Key Columns:** id, user_id, phone, address, city, state, latitude, longitude
- **Constraint:** UNIQUE(user_id)
- **Updated By:** Checkout.tsx (UPSERT)
- **Queried By:** Checkout.tsx

#### reviews
- **Purpose:** Product reviews and ratings
- **Key Columns:** id, user_id, product_id, rating, comment, image_url, owner_reply
- **Constraint:** UNIQUE(user_id, product_id)
- **Updated By:** ReviewSection.tsx (INSERT, UPDATE, DELETE)
- **Queried By:** ProductDetail.tsx, Shop.tsx (via RPC)

### Database Functions (RPC)

1. **add_to_cart(p_product_id, p_qty)**
   - Atomically add/update cart items
   - Called by: cart.ts

2. **can_user_review_product(p_user_id, p_product_id)**
   - Check if user has delivered order with product
   - Called by: reviewQueries.ts

3. **get_product_reviews(p_product_id)**
   - Get all reviews with user details
   - Called by: reviewQueries.ts

4. **get_product_average_rating(p_product_id)**
   - Calculate average rating
   - Called by: productRatingHooks.ts

5. **get_product_review_count(p_product_id)**
   - Count total reviews
   - Called by: productRatingHooks.ts

---

## 🔄 Data Flow Patterns

### Pattern 1: Product Browsing
```
User clicks "Shop" 
→ Header.tsx (Line 89) setCurrentPage('shop')
→ App.tsx (Line 267) renders Shop component
→ Shop.tsx (Line 82) useProductsQuery()
→ lib/utils.ts (Line 186) supabase.from("products").select()
→ Database: SELECT products.*, categories.* FROM products JOIN categories
→ Shop.tsx (Line 93) useProductsRatingsQuery()
→ lib/productRatingHooks.ts (Line 24) supabase.rpc('get_product_average_rating')
→ Database: RPC function queries reviews table
→ Shop.tsx (Line 398) renders ProductCard components with ratings
```

### Pattern 2: Add to Cart (Authenticated)
```
User clicks "Add to Cart"
→ Shop.tsx (Line 67) addToCart(product)
→ App.tsx (Line 109) addItemToUserCart()
→ lib/cart.ts (Line 115) supabase.rpc('add_to_cart')
→ Database: RPC function UPSERTS cart_items table
→ App.tsx (Line 111) refetchCart()
→ lib/cart.ts (Line 75) fetchUserCart()
→ Database: SELECT cart_items JOIN products
→ App.tsx updates cart state
→ Header.tsx shows updated cart count
```

### Pattern 3: Place Order (Authenticated)
```
User clicks "Place Order"
→ Checkout.tsx (Line 127) handlePlaceOrder()
→ Checkout.tsx (Line 234) INSERT customer_detail
→ Database: INSERT INTO customer_detail
→ Checkout.tsx (Line 253) INSERT orders
→ Database: INSERT INTO orders (with customer_detail_id)
→ Checkout.tsx (Line 340) clearCart()
→ lib/cart.ts (Line 202) DELETE cart_items
→ Database: DELETE FROM cart_items WHERE user_id = $1
→ App.tsx invalidates React Query cache
→ Redirect to home page
```

### Pattern 4: Submit Review
```
User clicks "Write a Review"
→ ReviewSection.tsx (Line 272) shows ReviewForm
→ User uploads image → Supabase Storage (review-images bucket)
→ ReviewSection.tsx (Line 75) submitReviewMutation.mutateAsync()
→ lib/reviewQueries.ts (Line 95) supabase.from('reviews').insert()
→ Database: INSERT INTO reviews (with UNIQUE constraint check)
→ React Query invalidates ['productReviews', productId]
→ ReviewSection.tsx refetches reviews
→ Database: RPC get_product_reviews() joins reviews + profiles + auth.users
→ UI updates with new review
```

### Pattern 5: Admin Updates Order Status
```
Admin selects new status
→ OrderStatusTabs.tsx (Line 50) onChange event
→ AdminPage.tsx (Line 217) handleStatusChange()
→ AdminPage.tsx (Line 186) updateOrderStatusMutation.mutate()
→ Database: UPDATE orders SET status = $1 WHERE id = $2
→ React Query invalidates ['adminOrders']
→ AdminPage.tsx refetches orders
→ UI updates with new status
```

---

## 🔐 Authentication Flow

### Signup Process
```
User fills signup form
→ Signup.tsx (Line 27) supabase.auth.signUp()
→ Supabase Auth: Creates user in auth.users table
→ Signup.tsx (Line 40) INSERT INTO profiles
→ Database: INSERT INTO profiles (id, first_name, last_name, email, role)
→ User receives confirmation email (if enabled)
→ Redirect to login
```

### Login Process
```
User enters credentials
→ Login.tsx (Line 13) supabase.auth.signInWithPassword()
→ Supabase Auth: Validates against auth.users
→ Creates session token
→ Stores in localStorage
→ Login.tsx (Line 25) window.location.reload()
→ App.tsx (Line 161) useEffect detects session
→ App.tsx (Line 176) onAuthStateChange listener
→ Fetches user cart
→ Updates UI with user info
```

---

## 🎯 Key Features & Their Implementation

### 1. Guest Checkout
- **Files:** Checkout.tsx, TrackOrder.tsx
- **Storage:** localStorage for guest sessions
- **Database:** guest_order table for order details
- **Flow:** Order created with user_id = null, guest_order record linked

### 2. Product Reviews with Owner Replies
- **Files:** ReviewSection.tsx, reviewQueries.ts
- **Storage:** Supabase Storage for review images
- **Database:** reviews table with owner_reply column
- **Validation:** can_user_review_product() checks for delivered orders

### 3. Real-time Cart Sync
- **Files:** App.tsx, cart.ts
- **Pattern:** React Query with automatic refetching
- **Auth Retry:** withAuthRetry() handles token expiration
- **Guest Support:** localStorage fallback

### 4. Admin Dashboard
- **Files:** AdminPage.tsx, OrderStatusTabs.tsx
- **Authorization:** Role-based (checks profiles.role = 'admin')
- **Features:** Order management, product CRUD, customer list
- **Real-time:** React Query auto-refetch on window focus

### 5. Product Ratings
- **Files:** productRatingHooks.ts, Shop.tsx
- **Calculation:** Database RPC functions for performance
- **Display:** StarRating component with review count
- **Caching:** React Query caches ratings per product

---

## 📊 Component Responsibility Matrix

| Component | Reads From | Writes To | Key Functions |
|-----------|-----------|-----------|---------------|
| Shop.tsx | products, categories, reviews | - | Product listing, filtering, sorting |
| ProductDetail.tsx | products, categories, reviews | - | Product display, review section |
| Cart.tsx | cart_items, products | - | Display cart (state from App.tsx) |
| Checkout.tsx | profiles, user_addresses | orders, customer_detail, guest_order, user_addresses | Order placement |
| Login.tsx | auth.users | - | Authentication |
| Signup.tsx | - | auth.users, profiles | User registration |
| Profile.tsx | profiles, orders, customer_detail | - | User profile display |
| UpdateProfile.tsx | profiles | profiles | Profile editing |
| ReviewSection.tsx | reviews, profiles | reviews, review-images (storage) | Review CRUD, owner replies |
| AdminPage.tsx | orders, products, categories, profiles | orders (status), products | Admin operations |
| TrackOrder.tsx | orders, guest_order, customer_detail | - | Order tracking |
| Header.tsx | profiles | - | Navigation, cart count |

---

## 🚀 Performance Optimizations

1. **React Query Caching**
   - 5-minute stale time for most queries
   - Automatic background refetching
   - Cache invalidation on mutations

2. **Database Indexing**
   - Indexes on foreign keys (user_id, product_id, order_id)
   - Unique constraints for performance

3. **RPC Functions**
   - Server-side aggregations (ratings, counts)
   - Reduces client-side processing

4. **Lazy Loading**
   - Components loaded on demand
   - Images with proper sizing

5. **Memoization**
   - useMemo for filtered/sorted products
   - useMemo for rating maps

---

## 🔧 Development Guidelines

### Adding a New Feature

1. **Create Component** in `src/components/`
2. **Add Route** in `App.tsx` renderPage() switch
3. **Create Query Hook** in `lib/utils.ts` or new file
4. **Update Database** if needed (add migration SQL)
5. **Test** both authenticated and guest flows

### Database Changes

1. **Write Migration SQL** in root directory
2. **Run in Supabase SQL Editor**
3. **Update TypeScript Types** if needed
4. **Update RLS Policies** for security
5. **Test with Different User Roles**

### Adding API Endpoint

1. **Create RPC Function** in database
2. **Add Query Hook** using React Query
3. **Handle Errors** with try-catch
4. **Invalidate Cache** on mutations
5. **Add Loading States** in UI

---

## 📝 Common Patterns

### React Query Hook Pattern
```typescript
export const useDataQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ["data", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const { data, error } = await supabase
        .from("table")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
```

### Mutation Pattern
```typescript
const mutation = useMutation({
  mutationFn: async (payload) => {
    const { data, error } = await supabase
      .from("table")
      .insert([payload]);
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["data"] });
    toast({ title: "Success" });
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message });
  },
});
```

### Auth Branching Pattern
```typescript
if (session?.user) {
  // Authenticated user logic
  await databaseOperation(session.user.id);
} else {
  // Guest user logic
  localStorageOperation();
}
```

---

## 🐛 Debugging Tips

1. **Check Browser Console** - All operations are logged
2. **React Query Devtools** - Inspect cache and queries
3. **Supabase Dashboard** - View database directly
4. **Network Tab** - Check API calls
5. **localStorage** - Inspect guest cart/sessions

### Common Issues

**Cart not updating:**
- Check React Query cache invalidation
- Verify refetchCart() is called
- Check auth token expiration

**Orders not showing:**
- Verify user_id matches
- Check RLS policies
- Inspect JOIN queries

**Reviews not submitting:**
- Check can_user_review_product() result
- Verify delivered order exists
- Check UNIQUE constraint

---

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Query Docs:** https://tanstack.com/query/latest
- **TailwindCSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/

---

**Last Updated:** 2026-03-01
**Version:** 1.0
**Maintainer:** Development Team

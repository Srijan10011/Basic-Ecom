# Web-Bolt - Detailed Flow Documentation (Part 2)
## Review System, Admin Dashboard, and Order Tracking

---

## 7. REVIEW SYSTEM

### Flow: User Submits a Review

**User Action:** Click "Write a Review" button on product detail page

**Code Flow:**

1. **ReviewSection.tsx** (Line 272-278)
   ```typescript
   {canReview && !userReview && !showReviewForm && (
     <Button
       onClick={() => setShowReviewForm(true)}
       className="bg-green-600 hover:bg-green-700"
     >
       Write a Review
     </Button>
   )}
   ```
   - Shows: Review form

2. **ReviewSection.tsx** (Line 310-318)
   ```typescript
   {showReviewForm && userId && (canReview || editingReview) && (
     <div className="mb-6">
       <ReviewForm
         productId={productId}
         userId={userId}
         existingReview={editingReview}
         onSuccess={handleFormSuccess}
         onCancel={handleFormCancel}
       />
     </div>
   )}
   ```
   - Renders: `ReviewForm` component

3. **ReviewSection.tsx** (Line 48-56)
   ```typescript
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (rating === 0) {
       alert('Please select a rating');
       return;
     }

     setIsSubmitting(true);
     let imageUrl = existingReview?.image_url || '';
   ```
   - Validates: Rating is selected

4. **ReviewSection.tsx** (Line 58-73)
   ```typescript
   try {
     if (imageFile) {
       const fileExt = imageFile.name.split('.').pop();
       const fileName = `${userId}_${Date.now()}.${fileExt}`;
       const { data: uploadData, error: uploadError } = await supabase.storage
         .from('review-images')
         .upload(fileName, imageFile);

       if (uploadError) {
         throw uploadError;
       }

       const { data: publicUrlData } = supabase.storage
         .from('review-images')
         .getPublicUrl(fileName);

       imageUrl = publicUrlData.publicUrl;
     }
   ```
   - Storage: Uploads image to Supabase Storage bucket 'review-images'

5. **ReviewSection.tsx** (Line 75-87)
   ```typescript
   if (existingReview) {
     await updateReviewMutation.mutateAsync({
       reviewId: existingReview.id,
       rating,
       comment,
       image_url: imageUrl,
     });
   } else {
     await submitReviewMutation.mutateAsync({
       userId,
       productId,
       rating,
       comment,
       image_url: imageUrl,
     });
   }
   ```
   - Calls: Submit or update mutation

6. **lib/reviewQueries.ts** (Line 95-119)
   ```typescript
   export const useSubmitReviewMutation = () => {
     const queryClient = useQueryClient();
     
     return useMutation({
       mutationFn: async ({ userId, productId, rating, comment, image_url }: {
         userId: string;
         productId: number;
         rating: number;
         comment: string;
         image_url: string;
       }) => {
         const { data, error } = await supabase
           .from('reviews')
           .insert({
             user_id: userId,
             product_id: productId,
             rating,
             comment,
             image_url
           })
           .select()
           .single();
         
         if (error) throw error;
         return data;
       },
       onSuccess: (_, variables) => {
         queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });
         queryClient.invalidateQueries({ queryKey: ['productReviewStats', variables.productId] });
         queryClient.invalidateQueries({ queryKey: ['userReview', variables.userId, variables.productId] });
       },
     });
   };
   ```
   - Tables: `reviews` (INSERT)

7. **Database Query:**
   ```sql
   INSERT INTO reviews (user_id, product_id, rating, comment, image_url)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *
   ```
   - Tables: `reviews` (INSERT)

8. **Database Constraint Check:**
   ```sql
   -- Unique constraint ensures one review per user per product
   UNIQUE(user_id, product_id)
   ```
   - Prevents: Duplicate reviews

### Flow: Product Owner Replies to Review

**User Action:** Click "Reply to Review" button (only visible to product owner)

**Code Flow:**

1. **ReviewSection.tsx** (Line 237-240)
   ```typescript
   const { data: product, isLoading: productLoading } = useProductQuery(productId);
   const isProductOwner = userId && product?.product_owner_id === userId;
   ```
   - Checks: If current user is product owner

2. **ReviewSection.tsx** (Line 147-154)
   ```typescript
   {isProductOwner && !review.owner_reply && !showOwnerReplyForm && (
     <Button
       variant="outline"
       size="sm"
       onClick={() => setShowOwnerReplyForm(true)}
       className="mt-4"
     >
       Reply to Review
     </Button>
   )}
   ```
   - Shows: Reply form

3. **ReviewSection.tsx** (Line 156-175)
   ```typescript
   {isProductOwner && showOwnerReplyForm && (
     <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
       <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
         {review.owner_reply ? 'Edit Your Reply' : 'Write a Reply'}
       </h4>
       <textarea
         value={ownerReplyText}
         onChange={(e) => setOwnerReplyText(e.target.value)}
         rows={3}
         className="..."
       />
       <div className="flex justify-end space-x-2 mt-2">
         <Button variant="outline" size="sm" onClick={() => setShowOwnerReplyForm(false)}>
           Cancel
         </Button>
         <Button size="sm" onClick={handleSubmitOwnerReply} disabled={submitOwnerReplyMutation.isPending}>
           {submitOwnerReplyMutation.isPending ? 'Submitting...' : 'Submit Reply'}
         </Button>
       </div>
     </div>
   )}
   ```
   - Renders: Reply textarea

4. **ReviewSection.tsx** (Line 109-120)
   ```typescript
   const handleSubmitOwnerReply = async () => {
     if (!ownerReplyText.trim()) return;
     try {
       await submitOwnerReplyMutation.mutateAsync({
         reviewId: review.id,
         ownerReply: ownerReplyText,
       });
       setShowOwnerReplyForm(false);
     } catch (error) {
       console.error('Error submitting owner reply:', error);
       alert('Failed to submit owner reply.');
     }
   };
   ```
   - Calls: Submit owner reply mutation

5. **lib/reviewQueries.ts** (Line 177-200)
   ```typescript
   export const useSubmitOwnerReplyMutation = () => {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: async ({ reviewId, ownerReply }: {
         reviewId: number;
         ownerReply: string;
       }) => {
         const { data, error } = await supabase
           .from('reviews')
           .update({ owner_reply: ownerReply, updated_at: new Date().toISOString() })
           .eq('id', reviewId)
           .select()
           .single();

         if (error) throw error;
         return data;
       },
       onSuccess: (data) => {
         queryClient.invalidateQueries({ queryKey: ['productReviews', data.product_id] });
       },
     });
   };
   ```
   - Tables: `reviews` (UPDATE)

6. **Database Query:**
   ```sql
   UPDATE reviews
   SET 
     owner_reply = $1,
     updated_at = NOW()
   WHERE id = $2
   RETURNING *
   ```
   - Tables: `reviews` (UPDATE owner_reply column)

---

## 8. ADMIN DASHBOARD

### Flow: Admin Views Dashboard

**User Action:** Navigate to /admin (or click admin link if role = 'admin')

**Code Flow:**

1. **App.tsx** (Line 318-325)
   ```typescript
   case 'admin':
     return (
       <div>
         <Header ... />
         <AdminPage setCurrentPage={setCurrentPage} />
         <Footer ... />
       </div>
     );
   ```
   - Renders: `AdminPage` component

2. **AdminPage.tsx** (Line 52-75)
   ```typescript
   useEffect(() => {
     async function checkUserAndRole() {
       try {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
           setIsAuthenticated(true);
           const { data: profileData, error: profileError } = await supabase
             .from('profiles')
             .select('role')
             .eq('id', user.id)
             .single();

           if (profileError) {
             console.error('Error fetching user role:', profileError);
             setUserRole(null);
           } else if (profileData) {
             setUserRole(profileData.role);
           }
         } else {
           setIsAuthenticated(false);
           setUserRole(null);
         }
       } catch (error) {
         console.error('Error checking user authentication:', error);
         setIsAuthenticated(false);
         setUserRole(null);
       } finally {
         setIsLoading(false);
       }
     }

     checkUserAndRole();
   }, []);
   ```
   - Tables: `profiles` (SELECT role)
   - Checks: User authentication and admin role

3. **AdminPage.tsx** (Line 78-86)
   ```typescript
   const { 
     data: orders = [], 
     isLoading: ordersLoading, 
     error: ordersError,
     refetch: refetchOrders 
   } = useAdminOrdersQuery(isAuthenticated && userRole === 'admin');
   ```
   - Fetches: All orders (only if admin)

4. **lib/utils.ts** (Line 319-413)
   ```typescript
   export const useAdminOrdersQuery = (enabled: boolean = true) => {
     return useQuery<AdminOrder[]>({
       queryKey: ["adminOrders"],
       queryFn: async (): Promise<AdminOrder[]> => {
         try {
           // Get all orders with customer details and guest orders
           const { data: orders, error: ordersError } = await supabase
             .from("orders")
             .select(`
               *,
               customer_detail(
                 customer_name,
                 shipping_address
               )
             `)
             .order("order_date", { ascending: false });

           if (ordersError) {
             throw ordersError;
           }

           // Explicitly fetch guest order details for orders with no user_id
           const ordersWithGuestDetails: AdminOrder[] = await Promise.all((orders || []).map(async (order) => {
             if (!order.user_id) {
               const { data: guestOrderData, error: guestOrderError } = await supabase
                 .from("guest_order")
                 .select(`
                   id,
                   order_id,
                   customer_name,
                   shipping_address,
                   customer_email,
                   created_at
                 `)
                 .eq("order_id", order.id)
                 .single();

               if (guestOrderError && guestOrderError.code !== "PGRST116") {
                 // Handle error
               }

               return {
                 ...order,
                 guest_order: guestOrderData || undefined,
               };
             }
             return order;
           }));

           // Process order items from JSONB field
           const finalOrders: AdminOrder[] = (ordersWithGuestDetails || []).map((order) => {
             const hasItemsField = order.hasOwnProperty("items");
             let orderItems: OrderItem[] = [];
             let note = "";

             if (hasItemsField && order.items) {
               try {
                 if (typeof order.items === "string") {
                   orderItems = JSON.parse(order.items);
                 } else if (Array.isArray(order.items)) {
                   orderItems = order.items;
                 }
                 note = "Items loaded from orders.items field";
               } catch (parseError) {
                 note = "Could not parse items from orders.items field";
               }
             }

             return {
               id: order.id,
               order_number: order.order_number || `ORDER-${order.id}`,
               total_amount: order.total_amount || "0.00",
               status: order.status || "pending",
               order_date: order.order_date || new Date().toISOString(),
               user_id: order.user_id,
               customer_details: order.customer_detail ? {
                 customer_name: order.customer_detail.customer_name || "Unknown Customer",
                 shipping_address: order.customer_detail.shipping_address || {}
               } : undefined,
               guest_order: order.guest_order ? {
                 id: order.guest_order.id,
                 order_id: order.id,
                 customer_name: order.guest_order.customer_name || "Guest Customer",
                 shipping_address: order.guest_order.shipping_address || {},
                 customer_email: order.guest_order.customer_email || "No email",
                 created_at: order.guest_order.created_at || new Date().toISOString()
               } : undefined,
               order_items: orderItems,
               _note: note,
             };
           });

           return finalOrders;
         } catch (err: any) {
           console.error("Exception in admin orders query:", err);
           throw err;
         }
       },
       enabled,
       ...
     });
   };
   ```
   - Tables: `orders`, `customer_detail`, `guest_order` (JOIN)

5. **Database Query:**
   ```sql
   SELECT 
     orders.*,
     customer_detail.customer_name,
     customer_detail.shipping_address
   FROM orders
   LEFT JOIN customer_detail ON orders.customer_detail_id = customer_detail.id
   ORDER BY orders.order_date DESC
   ```
   - Tables: `orders`, `customer_detail`

6. **AdminPage.tsx** (Line 88-96)
   ```typescript
   const { 
     data: products = [], 
     isLoading: productsLoading, 
     error: productsError,
     refetch: refetchProducts 
   } = useAdminProductsQuery(isAuthenticated && userRole === 'admin');
   ```
   - Fetches: All products

7. **lib/utils.ts** (Line 416-431)
   ```typescript
   export const useAdminProductsQuery = (enabled: boolean = true) => {
     return useQuery({
       queryKey: ["adminProducts"],
       queryFn: async () => {
         const { data, error } = await supabase.from("products").select("*");
         if (error) throw error;
         return data;
       },
       enabled,
       ...
     });
   };
   ```
   - Tables: `products` (SELECT all)

### Flow: Admin Updates Order Status

**User Action:** Select new status from dropdown in order list

**Code Flow:**

1. **OrderStatusTabs.tsx** (Line 50-60)
   ```typescript
   <select
     value={order.status}
     onChange={(e) => onStatusChange(order.id, e.target.value, order.user_id)}
     className="..."
   >
     <option value="pending">Pending</option>
     <option value="processing">Processing</option>
     <option value="shipped">Shipped</option>
     <option value="delivered">Delivered</option>
     <option value="cancelled">Cancelled</option>
   </select>
   ```
   - Calls: `onStatusChange(orderId, newStatus, userId)`

2. **AdminPage.tsx** (Line 217-220)
   ```typescript
   const handleStatusChange = (orderId: string, status: string, userId: string | null) => {
     console.log(`handleStatusChange called for Order ID: ${orderId}, Status: ${status}, User ID: ${userId}`);
     updateOrderStatusMutation.mutate({ id: orderId, status });
   };
   ```
   - Calls: Update mutation

3. **AdminPage.tsx** (Line 186-215)
   ```typescript
   const updateOrderStatusMutation = useMutation({
     mutationFn: async ({ id, status }: { id: string; status: string }) => {
       console.log(`Attempting to update order ${id} to status: ${status}`);
       const { data, error } = await supabase
         .from('orders')
         .update({ status })
         .eq('id', id);
       if (error) {
         console.error(`Supabase update error for order ${id}:`, error);
         throw error;
       }
       console.log(`Supabase update result for order ${id}:`, { data });
       return data;
     },
     onSuccess: (data, variables) => {
       console.log(`Order ${variables.id} status updated successfully to ${variables.status}.`, data);
       toast({
         title: "Order updated",
         description: "Order status has been updated successfully.",
       });
       queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
     },
     onError: (error, variables) => {
       console.error(`Failed to update order ${variables.id} to status ${variables.status}:`, error);
       toast({
         title: "Error",
         description: `Failed to update order status: ${error.message}. Please try again.`,
         variant: "destructive",
       });
     },
   });
   ```
   - Tables: `orders` (UPDATE)

4. **Database Query:**
   ```sql
   UPDATE orders
   SET status = $1
   WHERE id = $2
   ```
   - Tables: `orders` (UPDATE status column)

### Flow: Admin Adds New Product

**User Action:** Click "Add New Product" button

**Code Flow:**

1. **AdminPage.tsx** (Line 267-272)
   ```typescript
   <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
     <DialogTrigger asChild>
       <Button>Add New Product</Button>
     </DialogTrigger>
     ...
   </Dialog>
   ```
   - Opens: Product form dialog

2. **AdminPage.tsx** (Line 274-400)
   ```typescript
   <Form {...productForm}>
     <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
       <FormField control={productForm.control} name="name" ... />
       <FormField control={productForm.control} name="category" ... />
       <FormField control={productForm.control} name="price" ... />
       <FormField control={productForm.control} name="description" ... />
       <FormField control={productForm.control} name="image" ... />
       ...
     </form>
   </Form>
   ```
   - Renders: Product form with validation

3. **AdminPage.tsx** (Line 148-184)
   ```typescript
   const addProductMutation = useMutation({
     mutationFn: async (newProduct: ProductForm) => {
       const { data, error } = await supabase.from('products').insert([
         {
           name: newProduct.name,
           price: parseFloat(newProduct.price),
           image: newProduct.image,
           description: newProduct.description,
           category_id: newProduct.category,
           rating: newProduct.rating,
           reviews: newProduct.reviews,
           badge: newProduct.badge,
           badgeColor: newProduct.badgeColor,
           details: newProduct.details ? [newProduct.details] : [],
           product_owner_id: newProduct.product_owner_id,
         },
       ]);
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       toast({
         title: "Product added",
         description: "New product has been added successfully.",
       });
       queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
       setIsAddProductOpen(false);
       productForm.reset();
     },
     onError: () => {
       toast({
         title: "Error",
         description: "Failed to add product. Please try again.",
         variant: "destructive",
       });
     },
   });
   ```
   - Tables: `products` (INSERT)

4. **Database Query:**
   ```sql
   INSERT INTO products (
     name, price, image, description, category_id,
     rating, reviews, badge, badgeColor, details, product_owner_id
   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
   RETURNING *
   ```
   - Tables: `products` (INSERT)

---

## 9. ORDER TRACKING

### Flow: Guest Tracks Order

**User Action:** Enter order number in track order page

**Code Flow:**

1. **TrackOrder.tsx** (Line 30-40)
   ```typescript
   const handleTrackOrder = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setLoading(true);

     try {
       const { data, error } = await supabase
         .from('orders')
         .select(`
           *,
           guest_order(customer_name, shipping_address, customer_email),
           customer_detail(customer_name),
           items
         `)
         .eq('order_number', orderNumber)
         .single();
   ```
   - Tables: `orders`, `guest_order`, `customer_detail` (JOIN)

2. **Database Query:**
   ```sql
   SELECT 
     orders.*,
     guest_order.customer_name,
     guest_order.shipping_address,
     guest_order.customer_email,
     customer_detail.customer_name,
     orders.items
   FROM orders
   LEFT JOIN guest_order ON orders.id = guest_order.order_id
   LEFT JOIN customer_detail ON orders.customer_detail_id = customer_detail.id
   WHERE orders.order_number = $1
   LIMIT 1
   ```
   - Tables: `orders`, `guest_order`, `customer_detail`

3. **TrackOrder.tsx** (Line 50-60)
   ```typescript
   if (error) throw error;

   if (data) {
     // Parse items if it's a string
     if (typeof data.items === 'string') {
       try {
         data.items = JSON.parse(data.items);
       } catch (parseError) {
         console.error('Failed to parse items:', parseError);
         data.items = [];
       }
     }
     setOrder(data);
   } else {
     setError('Order not found. Please check your order number.');
   }
   ```
   - Parses: JSONB items field
   - Displays: Order details

---

## DATABASE TABLES SUMMARY

### Tables Updated by Each Component:

**Shop.tsx:**
- Reads: `products`, `categories`, `reviews` (via RPC)

**ProductDetail.tsx:**
- Reads: `products`, `categories`, `reviews` (via RPC)

**Cart.tsx:**
- Reads: `cart_items`, `products`
- Updates: `cart_items` (via App.tsx functions)

**Checkout.tsx:**
- Reads: `profiles`, `user_addresses`
- Inserts: `orders`, `customer_detail`, `guest_order`
- Updates: `user_addresses`
- Deletes: `cart_items` (clear cart)

**Login.tsx / Signup.tsx:**
- Reads: `auth.users` (via Supabase Auth)
- Inserts: `auth.users`, `profiles`

**Profile.tsx:**
- Reads: `profiles`, `orders`, `customer_detail`

**UpdateProfile.tsx:**
- Reads: `profiles`
- Updates: `profiles`

**ReviewSection.tsx:**
- Reads: `reviews`, `profiles`, `auth.users` (via RPC)
- Inserts: `reviews`
- Updates: `reviews` (edit review, owner reply)
- Deletes: `reviews`
- Storage: `review-images` bucket

**AdminPage.tsx:**
- Reads: `orders`, `customer_detail`, `guest_order`, `products`, `categories`, `profiles`
- Inserts: `products`
- Updates: `orders` (status), `products`

**TrackOrder.tsx:**
- Reads: `orders`, `guest_order`, `customer_detail`

---

## KEY ARCHITECTURAL PATTERNS

### 1. React Query for Data Management
- All database queries use React Query hooks
- Automatic caching and refetching
- Optimistic updates with cache invalidation

### 2. Supabase Client Pattern
- Single client instance in `supabaseClient.ts`
- Auth retry mechanism for expired tokens
- Connection health checks

### 3. Guest vs Authenticated User Branching
- Cart: localStorage vs database
- Orders: guest_order table vs customer_detail table
- Consistent pattern across components

### 4. RLS (Row Level Security)
- Database enforces user permissions
- RPC functions use SECURITY DEFINER
- Auth context passed via Supabase client

### 5. JSONB for Flexible Data
- Order items stored as JSONB
- Shipping addresses stored as JSONB
- Allows schema flexibility

---

END OF DOCUMENTATION

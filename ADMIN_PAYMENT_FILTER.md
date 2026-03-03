# ADMIN PAGE PAYMENT FILTERING IMPLEMENTATION

## CHANGES NEEDED:

### **STEP 1: Update AdminOrder Interface**

**File:** `/src/lib/utils.ts`

**FIND (around line 38):**
```typescript
export interface AdminOrder {
  id: string;
  order_number: string;
  total_amount: string;
  status: string;
  order_date: string;
  user_id?: string | null;
```

**ADD after `user_id` line:**
```typescript
  payment_reference_id?: string;
  payment_status?: string;
  payment_screenshot_url?: string | null;
```

---

### **STEP 2: Update useAdminOrdersQuery to fetch payment fields**

**File:** `/src/lib/utils.ts`

**FIND (around line 228):**
```typescript
const { data: orders, error: ordersError } = await supabase
  .from("orders")
  .select(`
    *,
    customer_detail!customer_detail_id(
      customer_name,
      shipping_address
    )
  `)
  .order("order_date", { ascending: false });
```

**REPLACE WITH:**
```typescript
const { data: orders, error: ordersError } = await supabase
  .from("orders")
  .select(`
    *,
    customer_detail!customer_detail_id(
      customer_name,
      shipping_address
    )
  `)
  .in('payment_status', ['payment_submitted', 'completed'])
  .order("order_date", { ascending: false });
```

**FIND (around line 315):**
```typescript
return {
  id: order.id,
  order_number: order.order_number || `ORDER-${order.id}`,
  total_amount: order.total_amount || "0.00",
  status: order.status || "pending",
  order_date: order.order_date || new Date().toISOString(),
  user_id: order.user_id,
```

**ADD after `user_id` line:**
```typescript
  payment_reference_id: order.payment_reference_id,
  payment_status: order.payment_status,
  payment_screenshot_url: order.payment_screenshot_url,
```

---

### **STEP 3: Display Payment Info in OrderStatusTabs**

**File:** `/src/features/orders/components/OrderStatusTabs.tsx`

**FIND the order details section (around line 140-160):**
```typescript
<TableCell>
  <div className="space-y-1">
    {order.order_items.map((item: any, idx: number) => (
      <div key={idx} className="text-sm">
        {item.name || item.product_id} × {item.quantity}
      </div>
    ))}
  </div>
</TableCell>
```

**ADD AFTER the items cell:**
```typescript
<TableCell>
  <div className="space-y-1 text-sm">
    {order.payment_reference_id && (
      <div>
        <span className="font-semibold">Ref ID:</span>
        <br />
        <span className="font-mono text-xs">{order.payment_reference_id}</span>
      </div>
    )}
    {order.payment_screenshot_url && (
      <a
        href={order.payment_screenshot_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline text-xs"
      >
        View Payment Proof
      </a>
    )}
  </div>
</TableCell>
```

**FIND the table header (around line 60-70):**
```typescript
<TableHead>Items</TableHead>
<TableHead>Total</TableHead>
```

**ADD AFTER Items header:**
```typescript
<TableHead>Payment Info</TableHead>
```

---

## SUMMARY:

**What this does:**
1. ✅ Only fetches orders with `payment_status = 'payment_submitted'` or `'completed'`
2. ✅ Excludes `'awaiting_payment'` orders from admin view
3. ✅ Shows payment reference ID in order list
4. ✅ Shows clickable link to payment screenshot
5. ✅ Adds new "Payment Info" column to orders table

**Orders filtered out:**
- Orders with `payment_status = 'awaiting_payment'`
- Orders with no payment status

**Orders shown:**
- Orders where user has submitted payment proof
- Orders marked as completed

---

Ready to apply these changes?

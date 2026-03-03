# TYPE SYSTEM AUDIT

## CURRENT TYPE FILES:

### 1. `/src/types/index.ts` (Main types)
```typescript
✅ Product
✅ CartItem  
✅ Order
✅ OrderStatus
✅ Review
✅ Category
```

### 2. `/src/types/payment.ts`
```typescript
✅ PaymentDetails
```

### 3. `/src/features/cart/types/checkout.ts`
```typescript
✅ CheckoutFormData
✅ CartItem (DUPLICATE!)
✅ OrderData
✅ PaymentFlowState
✅ GuestSession
```

### 4. `/src/constants/paymentMethods.ts`
```typescript
✅ PaymentMethod (interface)
```

### 5. `/src/constants/paymentConfig.ts`
```typescript
✅ PaymentMethodConfig
```

---

## ISSUES FOUND:

### 🔴 CRITICAL: Type Duplication
**CartItem defined in 2 places:**
1. `/src/types/index.ts` - 4 fields (id, name, price, image, quantity)
2. `/src/features/cart/types/checkout.ts` - 6 fields (adds description)

**Impact:** Inconsistent usage, potential bugs

---

### 🔴 CRITICAL: Missing Types (Used as `any`)

**From grep analysis:**
1. **Session** - Used 12+ times as `any`
2. **User** - Used 8+ times as `any`  
3. **Profile** - Exists in queries but no type
4. **AdminOrder** - Used in lib/utils.ts but not defined
5. **GuestOrder** - Used in lib/utils.ts but not defined

---

## CONSOLIDATION PLAN:

### Step 1: Merge Duplicate CartItem
**Decision:** Keep `/src/types/index.ts` version, add optional description

```typescript
// src/types/index.ts
export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    description?: string; // Add this
}
```

**Then delete from:** `/src/features/cart/types/checkout.ts`

---

### Step 2: Add Missing Core Types to `/src/types/index.ts`

```typescript
// Auth Types
export interface User {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_at?: number;
}

export interface Profile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

// Shipping
export interface ShippingAddress {
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
}
```

---

### Step 3: Keep Feature-Specific Types in Feature Folders

**Keep in `/src/features/cart/types/checkout.ts`:**
- CheckoutFormData ✅
- OrderData ✅
- PaymentFlowState ✅
- GuestSession ✅

**Keep in `/src/types/payment.ts`:**
- PaymentDetails ✅

**Keep in `/src/constants/paymentMethods.ts`:**
- PaymentMethod ✅
- PaymentMethodConfig ✅

---

### Step 4: Fix Import Paths

**Current mess:**
```typescript
// Some import from types/
import { Product } from '../../../types';

// Some import from features
import { CartItem } from '../types/checkout';

// Some use any
session: any
```

**After fix:**
```typescript
// Core types from central location
import { Product, CartItem, User, Session } from '@/types';

// Feature-specific types stay local
import { CheckoutFormData } from '../types/checkout';
```

---

## IMPLEMENTATION ORDER:

### Phase 1: Add Missing Types (10 min)
1. Add User, Session, Profile to `/src/types/index.ts`
2. Add ShippingAddress to `/src/types/index.ts`
3. Update CartItem to include description

### Phase 2: Remove Duplicates (5 min)
1. Remove CartItem from `/src/features/cart/types/checkout.ts`
2. Update imports in affected files

### Phase 3: Replace `any` Types (30 min)
1. Replace `session: any` → `session: Session | null`
2. Replace `user: any` → `user: User | null`
3. Replace `cart: any[]` → `cart: CartItem[]`
4. Replace `product: any` → `product: Product`

### Phase 4: Add Path Aliases (15 min)
1. Update tsconfig.json
2. Update vite.config.ts
3. Update imports to use `@/types` instead of `../../../types`

---

## FILES TO MODIFY:

### High Priority (Replace `any`):
1. ✅ `/src/App.tsx` - session, cart, user
2. ✅ `/src/shared/components/Header.tsx` - session, cart
3. ✅ `/src/features/cart/hooks/useCheckoutForm.ts` - session, user
4. ✅ `/src/features/products/components/ProductDetail.tsx` - session, product
5. ✅ `/src/features/admin/components/AdminPage.tsx` - product

### Medium Priority:
6. `/src/features/cart/services/cart.ts` - Remove `any` from error handling
7. `/src/lib/supabaseClient.ts` - Type the mock client properly

---

## FINAL TYPE STRUCTURE:

```
src/
├── types/
│   ├── index.ts          # Core shared types (Product, User, Session, etc.)
│   └── payment.ts        # Payment-specific types
├── features/
│   └── cart/
│       └── types/
│           └── checkout.ts  # Cart/checkout-specific types
└── constants/
    ├── paymentMethods.ts    # Payment method types & data
    └── paymentConfig.ts     # Payment config types & data
```

---

## BENEFITS:

✅ Single source of truth for core types  
✅ Feature-specific types stay in features  
✅ No more `any` types  
✅ Better IDE autocomplete  
✅ Catch errors at compile time  
✅ Easier refactoring  
✅ Self-documenting code  

---

**Estimated Time:** 1 hour  
**Risk:** Low (mostly additive changes)  
**Impact:** HIGH (fixes 69 `any` usages)

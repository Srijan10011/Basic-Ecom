# CODE ORGANIZATION REFACTORING PLAN

## VIOLATIONS FOUND:

### 1. **AdminPage.tsx** (650+ lines)
**Current:** Component + Auth Logic + Data Fetching + Business Logic
**Violations:**
- ❌ Auth check logic in component (lines 77-105)
- ❌ Mock API function in component (line 30)
- ❌ Manual refetch handlers (lines 142-154)
- ❌ Status color logic in component (line 244)
- ❌ Product form submission in component (line 207)

**Should be:**
- ✅ Component: Only UI rendering
- ✅ Hook: `useAdminAuth()` for auth check
- ✅ Hook: `useAdminData()` for data fetching
- ✅ Service: `adminService.ts` for API calls
- ✅ Utils: `orderHelpers.ts` for status colors

---

### 2. **App.tsx** (450+ lines)
**Current:** Routing + Cart + Auth + Theme + Connection Check
**Violations:**
- ❌ Cart operations (addToCart, updateCart, etc.) - lines 103-190
- ❌ Auth session management - lines 215-250
- ❌ Theme logic - lines 72-90
- ❌ Connection checking - lines 191-203
- ❌ Routing logic - lines 299-450

**Should be:**
- ✅ Hook: `useCart()` for cart operations
- ✅ Hook: `useAuth()` for session
- ✅ Hook: `useTheme()` for theme
- ✅ Component: `AppRouter` for routing

---

### 3. **GuestOrderAccess.tsx**
**Violations:**
- ❌ `getStatusColor()` - duplicate logic (line 96)
- ❌ `formatOrderDate()` - duplicate logic (line 113)
- ❌ `getRelativeTime()` - duplicate logic (line 122)

**Should be:**
- ✅ Import from `shared/utils/orderHelpers.ts`
- ✅ Import from `shared/utils/dateUtils.ts`

---

### 4. **Profile.tsx**
**Violations:**
- ❌ Debug console.log in production (line 35)

**Should be:**
- ✅ Remove or wrap in `if (process.env.NODE_ENV === 'development')`

---

## REFACTORING STRUCTURE:

```
src/
├── features/
│   ├── admin/
│   │   ├── components/
│   │   │   └── AdminPage.tsx          # UI only
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.ts        # NEW: Auth check
│   │   │   └── useAdminData.ts        # NEW: Data fetching
│   │   └── services/
│   │       └── adminService.ts        # NEW: API calls
│   │
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.ts             # NEW: Session management
│   │   └── services/
│   │       └── authService.ts         # EXISTS ✅
│   │
│   ├── cart/
│   │   ├── hooks/
│   │   │   └── useCart.ts             # NEW: Cart operations
│   │   └── services/
│   │       └── cart.ts                # EXISTS ✅
│   │
│   ├── theme/
│   │   └── hooks/
│   │       └── useTheme.ts            # NEW: Theme logic
│   │
│   └── navigation/
│       └── components/
│           └── AppRouter.tsx          # NEW: Routing logic
│
└── shared/
    └── utils/
        ├── orderHelpers.ts            # NEW: Status colors, etc.
        └── dateUtils.ts               # EXISTS ✅
```

---

## IMPLEMENTATION ORDER:

### Phase 1: Extract Utilities (15 min)
1. Create `shared/utils/orderHelpers.ts`
   - Move `getStatusColor()` from AdminPage & GuestOrderAccess
   - Move `getStatusBadgeColor()`

2. Update imports in:
   - AdminPage.tsx
   - GuestOrderAccess.tsx
   - OrderStatusTabs.tsx

### Phase 2: Extract Hooks from App.tsx (45 min)
1. Create `features/cart/hooks/useCart.ts`
   - Move: addToCart, updateCartQuantity, removeFromCart, clearCart, refetchCart
   
2. Create `features/auth/hooks/useAuth.ts`
   - Move: session state, auth initialization, session listener

3. Create `features/theme/hooks/useTheme.ts`
   - Move: theme state, toggleTheme, localStorage logic

4. Update App.tsx to use these hooks

### Phase 3: Extract Admin Logic (30 min)
1. Create `features/admin/hooks/useAdminAuth.ts`
   - Move: checkUserAndRole logic from AdminPage

2. Create `features/admin/hooks/useAdminData.ts`
   - Move: data fetching logic

3. Create `features/admin/services/adminService.ts`
   - Move: mockApiRequest (or remove if unused)

4. Update AdminPage.tsx to use these hooks

### Phase 4: Extract Routing (20 min)
1. Create `features/navigation/components/AppRouter.tsx`
   - Move: renderPage() function from App.tsx

2. Update App.tsx to use AppRouter

### Phase 5: Cleanup (10 min)
1. Remove debug console.logs
2. Delete empty folders
3. Verify all imports work

---

## EXPECTED RESULTS:

**Before:**
- App.tsx: 450 lines
- AdminPage.tsx: 650 lines
- Duplicate logic in 3 places

**After:**
- App.tsx: ~100 lines
- AdminPage.tsx: ~200 lines
- useCart.ts: ~80 lines
- useAuth.ts: ~60 lines
- useTheme.ts: ~30 lines
- useAdminAuth.ts: ~40 lines
- AppRouter.tsx: ~250 lines
- orderHelpers.ts: ~50 lines

**Benefits:**
✅ Each file has ONE responsibility
✅ Easy to test individual pieces
✅ Easy to find where logic lives
✅ No duplicate code
✅ Reusable hooks
✅ Better developer experience

---

## TOTAL TIME: ~2 hours

Ready to start? Which phase should we begin with?

export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CART_STORAGE_KEY = 'guest-cart-items';
export const GUEST_CONTACT_KEY = 'guestContactInfo';
export const THEME_STORAGE_KEY = 'theme';
export const AUTH_STORAGE_KEY = 'bolt-auth-token';

export const PAGINATION = {
    PRODUCTS_PER_PAGE: 12,
    ORDERS_PER_PAGE: 10,
} as const;

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
} as const;

export const PRICE_RANGES = {
    UNDER_20: { min: 0, max: 20, label: 'Under Rs 20' },
    RANGE_20_50: { min: 20, max: 50, label: 'Rs 20 - Rs 50' },
    OVER_50: { min: 50, max: Infinity, label: 'Over Rs 50' },
} as const;
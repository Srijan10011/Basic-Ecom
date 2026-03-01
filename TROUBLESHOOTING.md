T# Troubleshooting Database Connection Issues

## Problem: Data not loading after 2-3 page refreshes

This issue is typically caused by database connection problems or authentication state management issues. Here are the solutions implemented:

### 1. Environment Variables
Make sure you have a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Connection Health Checks
The app now includes:
- Automatic connection health checks
- Retry mechanisms for failed database operations
- Visual connection status indicators
- Better error handling and user feedback

### 3. Authentication State Management
- Improved session persistence
- Better error handling for auth state changes
- Automatic profile creation for new users

### 4. Retry Logic
- Database operations now retry up to 3 times with exponential backoff
- Connection status is monitored every 30 seconds
- Users can manually retry failed operations

## NEW: Browser Tab Visibility Issue

### Problem: Products don't load when switching from homepage to shop page after browser tab becomes inactive

**Root Cause**: When you navigate away from the browser tab (e.g., to Google) and then return, React components don't automatically re-fetch data when navigating between pages. This causes the products array to remain empty and the UI to show "Loading products..." indefinitely.

**UPDATED**: This issue affected ALL pages that fetch data from Supabase, including:
- Shop page (products)
- Profile page (user profile and orders)
- Checkout page (user profile and addresses)
- Product Detail page (individual product)
- Admin page (orders, products, categories)
- Track Order page (order status)
- Header component (admin status)
- Contact page (form submission)

### Solution Implemented:

1. **React Query Integration Across All Components**: 
   - Replaced manual state management with React Query for automatic data fetching in ALL data-fetching components
   - Added `refetchOnWindowFocus: true` to automatically refetch when tab becomes active
   - Added `refetchOnReconnect: true` for network reconnection scenarios

2. **Enhanced Refetch Behavior**:
   - Automatic refetch every 30 seconds when data arrays are empty
   - Smart refetch intervals that only trigger when data is missing
   - Manual retry buttons for users to force data reload

3. **Visibility Change Detection**:
   - All components now automatically refetch data when returning to the browser tab
   - Focus and network event listeners for comprehensive coverage
   - Automatic data refetching when navigating between pages after tab becomes active

4. **Improved User Experience**:
   - Better loading states with retry options across all pages
   - Informative messages when data fails to load
   - Connection status indicator in header (green wifi = connected, red wifi-off = disconnected)
   - Clear instructions for users when data loading issues occur
   - Loading spinners and retry buttons on all data-fetching components

### How It Works Now:

1. **Initial Load**: Data fetches normally when any page loads
2. **Tab Inactive**: When you switch to another tab, React Query marks all data as stale
3. **Tab Active**: When you return to the tab and navigate to ANY page, React Query automatically refetches the required data
4. **Fallback**: If automatic refetch fails, users see retry buttons and helpful error messages on all pages
5. **Continuous Monitoring**: Connection health is checked every 30 seconds globally

### Components Fixed:

- **Shop**: Products now auto-refetch when tab becomes active
- **Profile**: User profile and orders auto-refetch with retry buttons
- **Checkout**: User profile and address data auto-refetch
- **Product Detail**: Individual product data auto-refetch with retry functionality
- **Admin Page**: Orders, products, and categories auto-refetch
- **Track Order**: Order tracking data auto-refetch
- **Header**: Admin status auto-refetch
- **Contact**: Form submission uses React Query mutations

## Common Solutions

### If data still doesn't load:
1. Check your browser's network tab for failed requests
2. Verify your Supabase project is active and accessible
3. Ensure your environment variables are correctly set
4. Try clearing your browser's local storage and cookies
5. Check if your Supabase project has the required tables (products, profiles, orders, etc.)
6. **NEW**: Click the "Retry Loading" or "Reload Products" button on the shop page

### If you see connection errors:
1. Check your internet connection
2. Verify your Supabase project URL and API key
3. Ensure your Supabase project is not paused or in maintenance mode
4. Check your browser's console for detailed error messages
5. **NEW**: Look for the connection status indicator in the header (red wifi-off icon means disconnected)

### Performance Tips:
1. The app now caches data for 5 minutes to reduce database calls
2. Connection status is shown in the header (green wifi icon = connected, red wifi-off icon = disconnected)
3. Failed operations can be retried by clicking the retry button
4. **NEW**: Data automatically refetches when you return to the browser tab
5. **NEW**: Smart refetch intervals prevent unnecessary API calls

## Development Notes

The app now uses:
- React Query for better data fetching and caching
- Exponential backoff for retry attempts
- Connection health monitoring
- Improved error boundaries and user feedback
- **NEW**: Automatic refetching on tab visibility changes
- **NEW**: Enhanced user experience with retry mechanisms and helpful messages 
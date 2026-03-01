import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileQuery, useUserAddressesQuery } from '../lib/utils';
import MapPickerModal from './MapPickerModal';

interface CheckoutProps {
  cart: any[];
  setCurrentPage: (page: string) => void;
  session: any;
  clearCart: () => void | Promise<void>;
}

interface GuestSession {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  expiresAt: number;
  orderData: any;
}

export default function Checkout({ cart, setCurrentPage, session, clearCart }: CheckoutProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get current user
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getCurrentUser();
  }, []);

  // Use React Query for data fetching with automatic refetching
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

  // Manual refetch functions
  const handleRefetchProfile = async () => {
    await refetchProfile();
  };

  const handleRefetchAddress = async () => {
    await refetchAddress();
  };

  // Get email directly from user object like profile does
  const userEmail = user?.email || '';

  // Then in your useEffect, prioritize profile data but fall back to user data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
    } else if (session?.user) {
      // Fallback to session user data
      setFirstName(session.user.user_metadata?.first_name || '');
      setLastName(session.user.user_metadata?.last_name || '');
      setEmail(session.user.email || '');
    }
  }, [profile, session]);

  // Load guest contact info from localStorage if not authenticated
  useEffect(() => {
    if (!session) { // Only for guest users
      const savedContactInfo = localStorage.getItem('guestContactInfo');
      if (savedContactInfo) {
        try {
          const parsedInfo = JSON.parse(savedContactInfo);
          setFirstName(parsedInfo.firstName || '');
          setLastName(parsedInfo.lastName || '');
          setEmail(parsedInfo.email || '');
          setPhone(parsedInfo.phone || '');
        } catch (e) {
          console.error("Error parsing guest contact info from localStorage", e);
          // Clear invalid data to prevent future errors
          localStorage.removeItem('guestContactInfo');
        }
      }
    }
  }, [session]); // Run when session changes

  useEffect(() => {
    if (addressData) {
        setPhone(addressData.phone || '');
        setAddress(addressData.address || '');
        setCity(addressData.city || '');
        setState(addressData.state || '');
        // Removed automatic location pre-fill as per user request
        // if (addressData.latitude && addressData.longitude) {
        //   setLocation(`${addressData.latitude}, ${addressData.longitude}`);
        // }
      }
    
  }, [addressData]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("You denied the request for Geolocation. To use this feature, please enable location services for this site in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out.");
              break;
            default:
              alert("An unknown error occurred.");
              break;
          }
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

   
  const handlePlaceOrder = async () => {
    console.log('=== BUTTON CLICKED ===');
      if (isSubmitting) return;
  setIsSubmitting(true);

    console.log('User state:', user);
    console.log('Session state:', session);

    try {
      console.log('=== ORDER PLACEMENT STARTED ===');
      console.log('Cart items:', cart);
      console.log('Form data:', { firstName, lastName, email, phone, address, city, state, location });

      // Step 1: Get user (optional for guest checkout)
      console.log('Step 1: Getting user...');
      let currentUser = null; // Renamed to avoid conflict with outer scope 'user'
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.log('User not authenticated, proceeding as guest checkout');
        } else if (authUser) {
          currentUser = authUser;
          console.log('✓ User authenticated:', currentUser.id);
        } else {
          console.log('✓ User not authenticated, proceeding as guest.');
        }
      } catch (error) {
        console.log('Authentication check failed, proceeding as guest checkout');
      }

      // Step 2: Validate location
      console.log('Step 2: Validating location...');
      if (!location) {
        alert('Please click "Use my location" to proceed with the order.');
        return;
      }
      console.log('✓ Location validated:', location);

      // Step 3: Validate required fields
      console.log('Step 3: Validating required fields...');
      if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
        alert('Please fill in all required fields.');
        return;
      }
      console.log('✓ All required fields validated');

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
      console.log('Shipping address prepared:', shippingAddress);

      // Step 4: Save user address if user is authenticated
      if (currentUser) { // Use currentUser here
        console.log('Step 4: Saving user address...');
        const { error: upsertError } = await supabase
          .from('user_addresses')
          .upsert({
            user_id: currentUser.id, // Use currentUser.id here
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
        console.log('✓ Address saved successfully');
      }

      // Step 5: Prepare order data
      console.log('Step 5: Preparing order data...');
      const totalWithShipping = totalPrice + 5.99; // Calculate total with shipping
      const cartItems = cart; // Assuming cart is already in the correct format

      // Define formData and coordinates to match the expected structure in the changes
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode: '', // Assuming zipCode is not captured in the form
      };

      const coordinates = location
        ? {
            lat: parseFloat(location.split(', ')[0]),
            lng: parseFloat(location.split(', ')[1]),
          }
        : { lat: null, lng: null };

      // Create order data (without customer info)
      const orderData: any = {
        order_number: `ORD-${Date.now()}`,
        total_amount: totalWithShipping.toFixed(2),
        status: 'pending',
        order_date: new Date().toISOString(),
        user_id: currentUser?.id || null, // null for guest orders
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      // Prepare customer information
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
      console.log('Order data prepared:', orderData);

      // Step 6: Insert order
      console.log('Step 6: Inserting order into database...');
      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

      // First, let's validate the data before sending
      if (!orderData.order_number || !orderData.total_amount) {
        console.error('❌ Missing required fields:', orderData);
        alert('Please fill in all required fields');
        return;
      }

      // Handle customer information based on user type
      if (currentUser) {
        // Authenticated user - create customer_detail record
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

        // Add customer_detail_id to order
        orderData.customer_detail_id = customerDetail.id;
      } else {
        // Guest user - create guest_order record after order is created
        // We'll handle this after the order is inserted
      }

      // Insert the order
      let { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select(); // Add .select() to return the inserted data

      console.log('Insert response - data:', data);
      console.log('Insert response - error:', error);

      if (error) {
        console.error('❌ Order insert failed:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to place order: ${error.message}`);
        return;
      }

      // Check if data was returned
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ Order insert succeeded but returned no data');
        console.error('Data received:', data);

        // Try to fetch the order to see if it was actually created
        const { data: fetchedOrder, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderData.order_number)
          .single();

        if (fetchError || !fetchedOrder) {
          console.error('❌ Order was not created in database');
          alert('Failed to create order. Please try again.');
          return;
        } else {
          console.log('✓ Order found in database:', fetchedOrder);
          // Use the fetched order data
          data = [fetchedOrder];
        }
      }

      console.log('✓ Order placed successfully:', data);

      // Create guest_order record if this is a guest order
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
          // Don't fail the entire order for this, just log it
        } else {
          console.log('✓ Guest order details created successfully');
        }
      }

      // Invalidate user orders query to update Profile page immediately
      if (currentUser && typeof window !== 'undefined' && (window as any).queryClient) {
        console.log('Invalidating user orders cache for user:', currentUser.id);
        (window as any).queryClient.invalidateQueries(['userOrders', currentUser.id]);
      }

      // Create guest session if user is not authenticated
      if (!currentUser) { // Use currentUser here
        const guestSession: GuestSession = {
          orderId: data[0].id,
          orderNumber: orderData.order_number,
          customerEmail: email,
          customerName: `${firstName} ${lastName}`,
          orderData: {
            ...orderData,
            id: data[0].id
          },
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 // 24 hours
        };

        // Store multiple orders in localStorage
        const existingSessions = JSON.parse(localStorage.getItem('guestSessions') || '[]');
        existingSessions.push(guestSession);
        localStorage.setItem('guestSessions', JSON.stringify(existingSessions));

        // Save guest contact info to localStorage
        const guestContactInfo = {
          firstName,
          lastName,
          email,
          phone,
        };
        localStorage.setItem('guestContactInfo', JSON.stringify(guestContactInfo));

        // Show success message with session info
        alert(`Order placed successfully! Order #${orderData.order_number}. You can access your order details for the next 24 hours.`);
      } else {
        alert('Order placed successfully!');
      }

      await clearCart();
      setCurrentPage('home');

    } catch (error: any) {
      console.error('❌ UNEXPECTED ERROR:', error);
      console.error('Error stack:', error.stack);
      alert(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    }
     finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6 text-gray-500 dark:text-gray-400 text-base">+977</span>
                  <input 
                    type="tel" 
                    className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-12" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">State</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex space-x-2">
                  <button onClick={getLocation} className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm">
                    Use my location
                  </button>
                  <button onClick={() => setShowMapModal(true)} className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm">
                    Pick Location on Map
                  </button>
                  {location && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your location: {location}</p>}
                </div>
              </div>
            </div>
{showMapModal && (
                      <MapPickerModal
                        onClose={() => setShowMapModal(false)}
                        onLocationSelect={(lat, lng) => {
                          setLocation(`${lat}, ${lng}`);
                          setShowMapModal(false);
                        }}
                      />
                    )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0a2 2 0 012 2v3a2 2 0 012-2H7a2 2 0 01-2-2v-3a2 2 0 012-2h10zm-3 5a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Payment Method
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Credit/Debit Card</label>
                <div className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center">Secure payment form will be here.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                    <div>
                      <p className="text-gray-800 dark:text-white font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white">Rs {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Subtotal</p>
                <p className="font-semibold text-gray-800 dark:text-white">Rs {totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600 dark:text-gray-300">Shipping</p>
                <p className="font-semibold text-gray-800 dark:text-white">Rs 5.99</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-gray-800 dark:text-white">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">Rs {(totalPrice + 5.99).toFixed(2)}</p>
            </div>
            <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-lg transition-colors">
              {isSubmitting ? "Processing..." : "Place Order"} - Rs {(totalPrice + 5.99).toFixed(2)}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">By placing your order, you agree to our terms and conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
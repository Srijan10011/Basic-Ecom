import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileQuery, useUserAddressesQuery } from '../lib/utils';

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

  // Get current user
  const [user, setUser] = useState<any>(null);

  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useProfileQuery(session?.user?.id);
  
  const { 
    data: addressData, 
    isLoading: addressLoading, 
    error: addressError 
  } = useUserAddressesQuery(session?.user?.id);

  useEffect(() => {
    if (session?.user) {
      if (profile) {
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setEmail(profile.email || session.user.email || '');
      } else {
        setFirstName(session.user.user_metadata?.first_name || '');
        setLastName(session.user.user_metadata?.last_name || '');
        setEmail(session.user.email || '');
      }
    } else {
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
          localStorage.removeItem('guestContactInfo');
        }
      }
    }
  }, [session, profile]);

  useEffect(() => {
    if (addressData) {
      setPhone(addressData.phone || '');
      setAddress(addressData.address || '');
      setCity(addressData.city || '');
      setState(addressData.state || '');
    }
  }, [addressData]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
            },
            (error) => {
              alert("Error getting location: " + error.message);
            }
          );
        } else if (result.state === 'prompt') {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                // User denied the permission prompt
                alert("You denied the request for Geolocation.");
              } else {
                alert("Error getting location: " + error.message);
              }
            }
          );
        } else if (result.state === 'denied') {
          alert("You have denied Geolocation access. Please enable it in your browser settings.");
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const currentUser = session?.user;

      if (!location) {
        alert('Please click "Use my location" to proceed with the order.');
        return;
      }

      if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
        alert('Please fill in all required fields.');
        return;
      }

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

      if (currentUser) {
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
          phone: phone,
          address: address,
          city: city,
          state: state,
          zipCode: '',
          latitude: shippingAddress.latitude,
          longitude: shippingAddress.longitude
        }
      };

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

      let { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('❌ Order insert failed:', error);
        alert(`Failed to place order: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error('❌ Order insert succeeded but returned no data');
        alert('Failed to create order. Please try again.');
        return;
      }

      if (!currentUser) {
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
        }
      }

      if (currentUser && typeof window !== 'undefined' && (window as any).queryClient) {
        (window as any).queryClient.invalidateQueries(['userOrders', currentUser.id]);
      }

      if (!currentUser) {
        const guestSession = {
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

        const guestContactInfo = {
          firstName,
          lastName,
          email,
          phone,
        };
        localStorage.setItem('guestContactInfo', JSON.stringify(guestContactInfo));

        alert(`Order placed successfully! Order #${orderData.order_number}. You can access your order details for the next 24 hours.`);
      } else {
        alert('Order placed successfully!');
      }

      await clearCart();
      setCurrentPage('home');

    } catch (error: any) {
      console.error('❌ UNEXPECTED ERROR:', error);
      alert(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="md:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6 text-gray-500 text-base">+977</span>
                  <input 
                    type="tel" 
                    className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA] pl-12" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-black shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-[#FFFEFA]" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <button onClick={getLocation} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold text-sm">
                    Use my location
                  </button>
                  {location && <p className="mt-2 text-sm text-gray-500">Your location: {location}</p>}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0a2 2 0 012 2v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3a2 2 0 012-2h10zm-3 5a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Payment Method
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit/Debit Card</label>
                <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-4">
                  <p className="text-gray-500 text-center">Secure payment form will be here.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                    <div>
                      <p className="text-gray-800 font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t my-6"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-semibold text-gray-800">${totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="font-semibold text-gray-800">$5.99</p>
              </div>
            </div>
            <div className="border-t my-6"></div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-gray-800">Total</p>
              <p className="text-2xl font-bold text-gray-800">${(totalPrice + 5.99).toFixed(2)}</p>
            </div>
            <button onClick={handlePlaceOrder} className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors">
              Place Order - ${(totalPrice + 5.99).toFixed(2)}
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">By placing your order, you agree to our terms and conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
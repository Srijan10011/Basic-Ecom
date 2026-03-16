import { supabase } from '../../../lib/supabaseClient';
import { OrderData, CartItem, CheckoutFormData, GuestSession } from '../types/checkout';
import { generatePaymentReference } from '../../../shared/utils/paymentHelpers';
import { parseLocation } from './locationService';
import { sanitizeInput, sanitizeEmail, sanitizeUrl } from '../../../lib/sanitize';
export const fetchOrderDetails = async (orderId: string): Promise<{
  order: OrderData;
  reconstructedCart: CartItem[];
  email: string;
}> => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, customer_detail(*)')
    .eq('id', orderId)
    .single();

  if (error) throw error;

  // Reconstruct cart from order items
  let reconstructedCart: CartItem[] = [];
  if (order.items && Array.isArray(order.items)) {
    reconstructedCart = await Promise.all(
      order.items.map(async (item: any) => {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.id)
          .single();

        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: product?.image || '',
          description: product?.description || '',
        };
      })
    );
  }

  // Get email from profiles table using user_id
  let email = '';
  if (order.user_id) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', order.user_id)
      .single();
    email = userProfile?.email || '';
  } else {
    // Guest user - get from guest_order
    const { data: guestOrder } = await supabase
      .from('guest_order')
      .select('customer_email')
      .eq('order_id', order.id)
      .single();
    email = guestOrder?.customer_email || '';
  }

  return { order, reconstructedCart, email };
};

export const createOrder = async (
  form: CheckoutFormData,
  cart: CartItem[],
  currentUser: any,
  location: string
): Promise<OrderData> => {
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalWithShipping = totalPrice + 5.99;
  const { lat, lng } = parseLocation(location);
  const paymentRef = generatePaymentReference('PAY');

  const orderData: any = {
    order_number: `ORD-${Date.now()}`,
    total_amount: totalWithShipping.toFixed(2),
    status: 'pending',
    order_date: new Date().toISOString(),
    user_id: currentUser?.id || null,
    payment_reference_id: paymentRef,
    payment_status: 'awaiting_payment',
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  const customerInfo = {
    customer_name: sanitizeInput(`${form.firstName} ${form.lastName}`.trim() || 'Guest', 100),
    shipping_address: {
      phone: sanitizeInput(form.phone, 20),
      address: sanitizeInput(form.address, 200),
      city: sanitizeInput(form.city, 50),
      state: sanitizeInput(form.state, 50),
      zipCode: '',
      latitude: lat,
      longitude: lng,
    },
  };
  // Handle authenticated user
  if (currentUser) {
    await supabase.from('user_addresses').upsert(
      {
        user_id: currentUser.id,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: '',
        latitude: lat,
        longitude: lng,
      },
      { onConflict: 'user_id' }
    );

    const { data: customerDetail } = await supabase
      .from('customer_detail')
      .insert([{ user_id: currentUser.id, ...customerInfo }])
      .select()
      .single();

    if (customerDetail) {
      orderData.customer_detail_id = customerDetail.id;
    }
  }

  // Insert order
  const { data, error } = await supabase.from('orders').insert([orderData]).select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Failed to create order');

  // Handle guest user
  if (!currentUser && data.length > 0) {
    await supabase.from('guest_order').insert([
      {
        order_id: data[0].id,
        customer_name: customerInfo.customer_name,
        shipping_address: customerInfo.shipping_address,
        customer_email: sanitizeEmail(form.email), created_at: new Date().toISOString(),
      },
    ]);

    const guestSession: GuestSession = {
      orderId: data[0].id,
      orderNumber: orderData.order_number,
      customerEmail: sanitizeEmail(form.email),
      customerName: `${form.firstName} ${form.lastName}`,
      orderData: { ...orderData, id: data[0].id },
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };

    const existingSessions = JSON.parse(localStorage.getItem('guestSessions') || '[]');
    existingSessions.push(guestSession);
    localStorage.setItem('guestSessions', JSON.stringify(existingSessions));

    localStorage.setItem(
      'guestContactInfo',
      JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      })
    );
  }

  return data[0];
};

export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentMethod: string,
  screenshotUrl?: string
): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'payment_submitted',
      payment_method: sanitizeInput(paymentMethod, 50),
      payment_submitted_at: new Date().toISOString(),
      payment_screenshot_url: screenshotUrl ? sanitizeUrl(screenshotUrl) : null,
    })
    .eq('id', orderId);

  if (error) throw error;
};

import { useState, useEffect } from 'react';
import { fetchOrderDetails } from '../services/orderService';
import { CartItem } from '../types/checkout';

export const useOrderResume = (
  resumeOrderId: string | null,
  setResumeOrderId: (id: string | null) => void,
  onFormDataLoaded: (data: any) => void,
  onCartLoaded: (cart: CartItem[]) => void,
  onEmailLoaded: (email: string) => void,
  onOrderInfoLoaded: (orderId: string, referenceId: string, amount: string) => void,
  onOrderResumed?: () => void
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeOrderId) return;

    let isMounted = true;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const { order, reconstructedCart, email } = await fetchOrderDetails(resumeOrderId);

        if (!isMounted) return;

        if (order.customer_detail) {
          const addr = order.customer_detail.shipping_address;
          const nameParts = (order.customer_detail.customer_name || '').split(' ');

          onFormDataLoaded({
            firstName: nameParts[0] || '',
            lastName: nameParts[1] || '',
            phone: addr?.phone || '',
            address: addr?.address || '',
            city: addr?.city || '',
            state: addr?.state || '',
            location: addr?.latitude && addr?.longitude 
              ? `${addr.latitude}, ${addr.longitude}`
              : null,
          });
        }

        onCartLoaded(reconstructedCart);
        onEmailLoaded(email);
        onOrderInfoLoaded(order.id, order.payment_reference_id, order.total_amount);
        
        // Open payment dialog after loading
        onOrderResumed?.();

        setResumeOrderId(null);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
          console.error('Error loading order:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [resumeOrderId]);

  return { loading, error };
};

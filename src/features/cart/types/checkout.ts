export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  location: string | null;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface OrderData {
  id: string;
  order_number: string;
  total_amount: string;
  payment_reference_id: string;
  payment_status: string;
  items: CartItem[];
  customer_detail?: {
    customer_name: string;
    customer_email?: string;
    shipping_address: {
      phone: string;
      address: string;
      city: string;
      state: string;
      latitude: number;
      longitude: number;
    };
  };
  user_id?: string;
}

export interface PaymentFlowState {
  showPaymentDialog: boolean;
  showPaymentDetailsDialog: boolean;
  selectedPayment: string | null;
  currentOrderId: string | null;
  paymentReferenceId: string | null;
  currentOrderAmount: string | null;
  currentOrderNumber: string | null;
}

export interface GuestSession {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  expiresAt: number;
  orderData: any;
}

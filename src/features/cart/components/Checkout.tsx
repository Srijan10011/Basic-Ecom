import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import MapPickerModal from '../../../shared/components/MapPickerModal';
import { getEnabledPaymentMethods } from '../../../constants/paymentMethods';
import PaymentDetailsDialog from './PaymentMethodDetails/PaymentDetailsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';

import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { usePaymentFlow } from '../hooks/usePaymentFlow';
import { useOrderResume } from '../hooks/useOrderResume';
import { createOrder } from '../services/orderService';
import { validateFormAndLocation , validateField } from '../services/validationService';
import { getGeolocation, formatLocation } from '../services/locationService';
import { CartItem } from '../types/checkout';
interface CheckoutProps {
  cart: any[];
  setCurrentPage: (page: string) => void;
  session: any;
  clearCart: () => void | Promise<void>;
  resumeOrderId: string | null;
  setResumeOrderId: (id: string | null) => void;
  setTrackOrderId: (id: string) => void;
}

export default function Checkout({
  cart,
  setCurrentPage,
  session,
  clearCart,
  resumeOrderId,
  setResumeOrderId,
  setTrackOrderId,
}: CheckoutProps) {
  const [user, setUser] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reconstructedCart, setReconstructedCart] = useState<CartItem[]>([]);
  const [isResumingOrder, setIsResumingOrder] = useState(false);

  const { form, updateField, setFormData } = useCheckoutForm(session, user, resumeOrderId);
  const payment = usePaymentFlow();

  const handleFormDataLoaded = useCallback((data: any) => setFormData(data), [setFormData]);
  const handleCartLoaded = useCallback((cart: CartItem[]) => setReconstructedCart(cart), []);
  const handleEmailLoaded = useCallback((email: string) => updateField('email', email), [updateField]);
  const handleOrderInfoLoaded = useCallback((orderId: string, refId: string, amount: string) => payment.setOrderInfo(orderId, refId, amount), [payment]);
  const handleOrderResumed = useCallback(() => {
    setIsResumingOrder(true);
    payment.openPaymentDialog();
  }, [payment]);
  

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };
    getCurrentUser();
  }, []);

  // Resume order
  useOrderResume(
    resumeOrderId,
    setResumeOrderId,
    handleFormDataLoaded,
    handleCartLoaded,
    handleEmailLoaded,
    handleOrderInfoLoaded,
    handleOrderResumed
  );

  const displayCart = resumeOrderId || isResumingOrder ? reconstructedCart : cart;
  const isLoadingResumedOrder = (resumeOrderId || isResumingOrder) && reconstructedCart.length === 0;
  const totalPrice = displayCart.reduce((total, item) => total + item.price * item.quantity, 0);
const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

const handleFieldChange = (fieldName: string, value: string) => {
  updateField(fieldName as keyof typeof form, value);
  const isValid = validateField(fieldName, value);
  setFieldErrors(prev => ({
    ...prev,
    [fieldName]: !isValid && value.length > 0
  }));
};
  const handleGetLocation = async () => {
    try {
      const { latitude, longitude } = await getGeolocation();
      updateField('location', formatLocation(latitude, longitude));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const validation = validateFormAndLocation(form, form.location);
      if (!validation.valid) {
        alert(validation.error);
        setIsSubmitting(false);
        return;
      }

      let currentUser = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        currentUser = authUser;
      } catch (error) {
        console.log('Guest checkout');
      }

      const order = await createOrder(form, displayCart, currentUser, form.location!);

      payment.setOrderInfo(order.id, order.payment_reference_id, order.total_amount);
      payment.setOrderNumber(order.order_number);
      payment.openPaymentDialog();
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
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
  <input
    type="text"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
      fieldErrors.firstName ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.firstName}
    onChange={(e) => handleFieldChange('firstName', e.target.value)}
  />
  {fieldErrors.firstName && <p className="text-red-500 text-sm mt-1">First name is required</p>}
</div>
                
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Last Name</label>
  <input
    type="text"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
      fieldErrors.lastName ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.lastName}
    onChange={(e) => handleFieldChange('lastName', e.target.value)}
  />
  {fieldErrors.lastName && <p className="text-red-500 text-sm mt-1">Last name is required</p>}
</div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                  <input
  type="email"
  className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
    fieldErrors.email ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
  }`}
  value={form.email}
  onChange={(e) => handleFieldChange('email', e.target.value)}
/>
{fieldErrors.email && <p className="text-red-500 text-sm mt-1">Invalid email format</p>}
                </div>
                <div className="md:col-span-2 relative">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-6 text-gray-500 dark:text-gray-400 text-base">+977</span>
  <input
    type="tel"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-12 ${
      fieldErrors.phone ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.phone}
    onChange={(e) => handleFieldChange('phone', e.target.value)}
  />
  {fieldErrors.phone && <p className="text-red-500 text-sm mt-1">Phone must be at least 7 digits</p>}
</div>
                <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
  <input
    type="text"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
      fieldErrors.address ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.address}
    onChange={(e) => handleFieldChange('address', e.target.value)}
  />
  {fieldErrors.address && <p className="text-red-500 text-sm mt-1">Address is required</p>}
</div>
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
  <input
    type="text"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
      fieldErrors.city ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.city}
    onChange={(e) => handleFieldChange('city', e.target.value)}
  />
  {fieldErrors.city && <p className="text-red-500 text-sm mt-1">City is required</p>}
</div>
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">State</label>
  <input
    type="text"
    className={`mt-1 block w-full rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-base p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
      fieldErrors.state ? 'border-2 border-red-500' : 'border-black dark:border-gray-600'
    }`}
    value={form.state}
    onChange={(e) => handleFieldChange('state', e.target.value)}
  />
  {fieldErrors.state && <p className="text-red-500 text-sm mt-1">State is required</p>}
</div>
                <div className="md:col-span-2 flex space-x-2">
                  <button
                    onClick={handleGetLocation}
                    className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm"
                  >
                    Use my location
                  </button>
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="w-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold text-sm"
                  >
                    Pick Location on Map
                  </button>
                  {form.location && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your location: {form.location}</p>}
                </div>
              </div>
            </div>
            {showMapModal && (
              <MapPickerModal
                onClose={() => setShowMapModal(false)}
                onLocationSelect={(lat, lng) => {
                  updateField('location', formatLocation(lat, lng));
                  setShowMapModal(false);
                }}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Order Summary</h2>
            {isLoadingResumedOrder ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {displayCart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4" />
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
                <button
                  onClick={isResumingOrder ? payment.openPaymentDialog : handlePlaceOrder}
                  disabled={isSubmitting && !isResumingOrder}
                  className="w-full mt-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  {isResumingOrder 
                    ? `Proceed to Payment - Rs ${(totalPrice + 5.99).toFixed(2)}`
                    : `${isSubmitting ? 'Processing...' : 'Place Order'} - Rs ${(totalPrice + 5.99).toFixed(2)}`
                  }
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">By placing your order, you agree to our terms and conditions.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={payment.showPaymentDialog} onOpenChange={payment.closePaymentDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {getEnabledPaymentMethods().map((method) => (
              <div
                key={method.id}
                onClick={() => payment.selectPaymentMethod(method.id)}
                className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">{method.name}</span>
                  {method.id === 'card' ? (
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <span className={`text-2xl font-bold ${method.color}`}>{method.displayName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      {payment.showPaymentDetailsDialog && payment.currentOrderId && payment.paymentReferenceId && (
        <PaymentDetailsDialog
          open={payment.showPaymentDetailsDialog}
          onClose={payment.closePaymentDetailsDialog}
          paymentMethod={payment.selectedPayment || 'esewa'}
          orderId={payment.currentOrderId}
          amount={parseFloat(payment.currentOrderAmount || (totalPrice + 5.99).toString())}
          paymentReferenceId={payment.paymentReferenceId}
          orderNumber={payment.currentOrderNumber || ''}
          clearCart={clearCart}
          setCurrentPage={setCurrentPage}
          setTrackOrderId={setTrackOrderId}
        />
      )}
    </div>
  );
}

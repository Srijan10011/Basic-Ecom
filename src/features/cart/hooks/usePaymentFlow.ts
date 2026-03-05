import { useState } from 'react';
import { PaymentFlowState } from '../types/checkout';

export const usePaymentFlow = () => {
  const [state, setState] = useState<PaymentFlowState>({
    showPaymentDialog: false,
    showPaymentDetailsDialog: false,
    selectedPayment: null,
    currentOrderId: null,
    paymentReferenceId: null,
    currentOrderAmount: null,
  });

  const openPaymentDialog = () => {
    setState(prev => ({ ...prev, showPaymentDialog: true }));
  };

  const closePaymentDialog = () => {
    setState(prev => ({ ...prev, showPaymentDialog: false }));
  };

  const selectPaymentMethod = (method: string) => {
    setState(prev => ({
      ...prev,
      selectedPayment: method,
      showPaymentDialog: false,
      showPaymentDetailsDialog: true,
    }));
  };

  const closePaymentDetailsDialog = () => {
    setState(prev => ({ ...prev, showPaymentDetailsDialog: false }));
  };

  const setOrderInfo = (orderId: string, referenceId: string, amount: string) => {
    setState(prev => ({
      ...prev,
      currentOrderId: orderId,
      paymentReferenceId: referenceId,
      currentOrderAmount: amount,
    }));
  };
  const setOrderNumber = (orderNumber: string) => {
    setState(prev => ({
      ...prev,
      currentOrderNumber: orderNumber,
    }));
  };

  const reset = () => {
    setState({
      showPaymentDialog: false,
      showPaymentDetailsDialog: false,
      selectedPayment: null,
      currentOrderId: null,
      paymentReferenceId: null,
      currentOrderAmount: null,
      currentOrderNumber: null,
    });
  };

  return {
    ...state,
    openPaymentDialog,
    closePaymentDialog,
    selectPaymentMethod,
    closePaymentDetailsDialog,
    setOrderInfo,
    reset,
    setOrderNumber,
  };
};

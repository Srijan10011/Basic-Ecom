export interface PaymentDetails {
    orderId: string;
    orderNumber: string;
    amount: number;
    paymentMethod: string;
    paymentReferenceId: string;
    paymentStatus: 'awaiting_payment' | 'payment_submitted' | 'verifying' | 'completed' | 'failed';
}
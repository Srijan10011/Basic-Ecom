export interface PaymentMethod {
    id: string;
    name: string;
    displayName: string;
    color: string;
    enabled: boolean;
}

export const paymentMethods: PaymentMethod[] = [
    
    {
        id: 'esewa',
        name: 'eSewa',
        displayName: 'eSewa',
        color: 'text-green-600',
        enabled: true
    },
    {
        id: 'khalti',
        name: 'Khalti',
        displayName: 'Khalti',
        color: 'text-purple-600',
        enabled: true
    }
];
export const getEnabledPaymentMethods = () => paymentMethods.filter(method => method.enabled);
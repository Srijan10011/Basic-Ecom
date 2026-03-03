export interface PaymentMethod {
    id: string;
    name: string;
    displayName: string;
    color: string;
    enabled: boolean;
}

export const paymentMethods: PaymentMethod[] = [
    {
        id: 'card',
        name: 'Credit/Debit Card',
        displayName: 'Card',
        color: 'text-gray-600',
        enabled: true
    },
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
    },
    {
        id: 'yoo',
        name: 'yoo',
        displayName: 'yoo',
        color: 'text-purple-600',
        enabled: true
    }
];
export const getEnabledPaymentMethods = () => paymentMethods.filter(method => method.enabled);
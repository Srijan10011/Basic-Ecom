export interface PaymentMethodConfig {
    id: string;
    accountId: string;
    qrCodeUrl: string;
    instructions: string[];
}

export const paymentConfigs: Record<string, PaymentMethodConfig> = {
    esewa: {
        id: 'esewa',
        accountId: '9876543210',
        qrCodeUrl: '/images/esewa-qr.png', // Add your QR image to public folder
        instructions: [
            'Scan QR code or send to eSewa ID above',
            'Enter the exact amount shown',
            '⚠️ IMPORTANT: Add the Payment Reference ID in remarks/description',
            'Complete the payment',
            'Click "I have paid" button below'
        ]
    },
    khalti: {
        id: 'khalti',
        accountId: '9876543210',
        qrCodeUrl: '/images/khalti-qr.png',
        instructions: [
            'Scan QR code or send to Khalti number above',
            'Enter the exact amount shown',
            '⚠️ IMPORTANT: Add the Payment Reference ID in remarks/description',
            'Complete the payment',
            'Click "I have paid" button below'
        ]
    },

    yoo: {
        id: 'yoo',
        accountId: '9876543210',
        qrCodeUrl: '/images/yoo-qr.png',
        instructions: [
            'Scan QR code or send to yoo number above',
            'Enter the exact amount shown',
            '⚠️ IMPORTANT: Add the Payment Reference ID in remarks/description',
            'Complete the payment',
            'Click "I have paid" button below'
        ]
    },
};
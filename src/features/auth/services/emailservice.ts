const MAILGUN_API_KEY = import.meta.env.VITE_MAILGUN_API_KEY;
const MAILGUN_DOMAIN = import.meta.env.VITE_MAILGUN_DOMAIN;

if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    throw new Error("Mailgun environment variables are not set");
}

const mailgunBase64 = btoa(`api:${MAILGUN_API_KEY}`);
export async function sendEmail({
    to,
    subject,
    text,
    from = `A and C Mushroom <postmaster@${MAILGUN_DOMAIN}>`,
}: {
    to: string;
    subject: string;
    text: string;
    from?: string;
}) {
    try {
        const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${mailgunBase64}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                from,
                to,
                subject,
                text,
            }),
        });
        const data = await response.json();
        console.log("Email sent:", data);
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export async function sendWelcomeEmail(firstName: string, email: string) {
    await sendEmail({
        to: email,
        subject: `Welcome to A And C Mushroom Farm, ${firstName}!`,
        text: `Hi ${firstName},

Welcome to A And C Mushroom Farm! We're excited to have you as a new member of our community.

With your account, you can:
- Browse our  mushroom products
- Track your orders in real-time
- Save items to your wishlist
- Get exclusive deals and updates

If you have any questions, feel free to reach out to us.

Happy shopping!
The A And C Mushroom Farm Team
`
    });
}
export async function sendOrderConfirmationEmail(order: any, email: string) {
  const subject = `Order Confirmation #${order.order_number}`;
  const itemsList = order.items?.map((item: any) =>
    `- ${item.name} x${item.quantity} = Rs ${item.price * item.quantity}`
  ).join('\n');
const customerName = order.customer_detail?.customer_name || 'Customer';
  const shippingAddress = order.customer_detail?.shipping_address || {};
  const mapsLink = shippingAddress.latitude && shippingAddress.longitude? `https://maps.google.com/?q=${shippingAddress.latitude},${shippingAddress.longitude}`: 'N/A';
  const text = `Hi ${customerName},


Thank you for your order! We've received your order and payment details

Order Details:
Order Number: ${order.order_number}
Total Amount: Rs ${order.total_amount}
Payment Method: ${order.payment_method}
Payment Reference ID: ${order.payment_reference_id || 'N/A'}

Items:
${itemsList}

Shipping to:
${shippingAddress.address || 'N/A'}${order.customer_detail?.shipping_address?.city}, ${order.customer_detail?.shipping_address?.state}
${shippingAddress.city || ''}, ${shippingAddress.state || ''}
${shippingAddress.phone || ''}
Location (Google Maps): ${mapsLink}
Your order is currently being processed. Once our team verifies your payment, we'll proceed with preparing your order for shipment. You'll receive a notification when your order ships!

 Thank you for choosing A and C Mushroom Farm!
`;

  await sendEmail({ to: email, subject, text });
}
export async function sendOrderStatusEmail(order: any, status: string) {
  const subject = `Order Status Update #${order.order_number}`;
  const customerName = order.customer_detail?.customer_name || 'Customer';
  const shippingAddress = order.customer_detail?.shipping_address || {};

  let message = '';
  if (status === 'processing') {
    message = `Your order has been verified and is now being processed. Your payment has been confirmed and we're preparing your order for shipment. You'll receive another update once your order ships!`;
  }

  const text = `Hi ${customerName},

${message}

Order Details:
Order Number: ${order.order_number}
Total Amount: Rs ${order.total_amount}
Payment Method: ${order.payment_method}

Shipping to:
${shippingAddress.address || 'N/A'}
${shippingAddress.city || ''}, ${shippingAddress.state || ''}
${shippingAddress.phone || ''}

Thank you for choosing A and C Mushroom Farm!

The A and C Mushroom Farm Team
`;

  const email = order.customer_email || order.customer_detail?.customer_email || '';
  await sendEmail({ to: email, subject, text });
}

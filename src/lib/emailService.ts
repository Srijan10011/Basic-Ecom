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
  from = `AandC <postmaster@${MAILGUN_DOMAIN}>`,
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
    subject: `Welcome to A&A Mushroom Farm, ${firstName}!`,
    text: `Hi ${firstName},

Welcome to A&A Mushroom Farm! We're excited to have you as a new member of our community.

With your account, you can:
- Browse our premium mushroom products
- Track your orders in real-time
- Save items to your wishlist
- Get exclusive deals and updates

If you have any questions, feel free to reach out to us.

Happy shopping!
The A&A Mushroom Farm Team
`
  });
}

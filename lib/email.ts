import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation({
  to,
  customerName,
  reference,
  amount,
}: {
  to: string
  customerName: string
  reference: string
  amount: number
}) {
  await resend.emails.send({
    from: 'Reine Luxe <orders@reineluxe.com>',
    to,
    subject: 'Your Order is Confirmed – Reine Luxe',
    html: `
      <div style="font-family:serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-size:28px;letter-spacing:4px">REINE LUXE</h1>
        <h2>Order Confirmed</h2>
        <p>Dear ${customerName},</p>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;color:#666">Reference</td><td style="padding:8px 0;font-weight:bold">${reference}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Amount</td><td style="padding:8px 0;font-weight:bold">₦${amount.toLocaleString()}</td></tr>
        </table>
        <p>We'll send tracking information once your order ships.</p>
        <p style="color:#666;font-size:12px;margin-top:40px">Reine Luxe Co. · support@reineluxe.com</p>
      </div>
    `,
  })
}

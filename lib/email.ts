import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

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
  console.log('[Email] sendOrderConfirmation called with:', {
    to,
    customerName,
    reference,
    amount,
    from: process.env.GMAIL_USER
  })

  try {
    const result = await transporter.sendMail({
      from: `"Reine Luxe" <${process.env.GMAIL_USER}>`,
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
          <p style="margin:24px 0">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://reineluxe.com'}/track-order?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(to)}"
               style="display:inline-block;background:#d4af37;color:#0a0a0a;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:2px">
              Track Your Order
            </a>
          </p>
          <p style="color:#666;font-size:13px">No account needed — use your reference and this email address.</p>
          <p style="color:#666;font-size:12px;margin-top:40px">Reine Luxe Co. · support@reineluxe.com</p>

        </div>
      `,
    })

    console.log('[Email] sendOrderConfirmation success:', {
      messageId: result.messageId,
      to,
      reference
    })

    return result
  } catch (error) {
    console.error('[Email] sendOrderConfirmation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
      customerName,
      reference
    })
    throw error
  }
}

const STATUS_META: Record<string, { subject: string; heading: string; body: string }> = {
  pending: {
    subject: 'Order Received – Reine Luxe',
    heading: 'We\'ve Received Your Order',
    body: 'Thank you for your order! We have received it and are awaiting payment confirmation.',
  },
  paid: {
    subject: 'Payment Confirmed – Reine Luxe',
    heading: 'Payment Confirmed',
    body: 'Great news! Your payment has been confirmed and your order is now being prepared.',
  },
  processing: {
    subject: 'Your Order is Being Processed – Reine Luxe',
    heading: 'Order Being Processed',
    body: 'Great news! Your payment has been confirmed and your order is now being prepared.',
  },
  shipped: {
    subject: 'Your Order Has Shipped – Reine Luxe',
    heading: 'Your Order Has Shipped',
    body: 'Great news! Your order is on its way. You can track your package using the tracking number below.',
  },
  delivered: {
    subject: 'Your Order Has Been Delivered – Reine Luxe',
    heading: 'Order Delivered',
    body: 'Your order has been delivered. We hope you love your new pieces! If you have any questions, our support team is here to help.',
  },
  cancelled: {
    subject: 'Your Order Has Been Cancelled – Reine Luxe',
    heading: 'Order Cancelled',
    body: 'Your order has been cancelled. If you did not request this cancellation or have any questions, please contact our support team.',
  },
}

export async function sendOrderStatusUpdate({
  to,
  customerName,
  reference,
  status,
  trackingNumber,
}: {
  to: string
  customerName: string
  reference: string
  status: string
  trackingNumber?: string
}) {
  const meta = STATUS_META[status]
  if (!meta) return

  console.log('[Email] sendOrderStatusUpdate called with:', {
    to,
    customerName,
    reference,
    status,
    from: process.env.GMAIL_USER
  })

  try {
    const result = await transporter.sendMail({
      from: `"Reine Luxe" <${process.env.GMAIL_USER}>`,
      to,
      subject: meta.subject,
    html: `
      <div style="font-family:serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-size:28px;letter-spacing:4px">REINE LUXE</h1>
        <h2>${meta.heading}</h2>
        <p>Dear ${customerName},</p>
        <p>${meta.body}</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;color:#666">Order Reference</td><td style="padding:8px 0;font-weight:bold">${reference}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Status</td><td style="padding:8px 0;font-weight:bold;text-transform:uppercase">${status}</td></tr>
          ${trackingNumber ? `<tr><td style="padding:8px 0;color:#666">Tracking Number</td><td style="padding:8px 0;font-weight:bold">${trackingNumber}</td></tr>` : ''}
        </table>
        <p style="margin:24px 0">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://reineluxe.com'}/track-order?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(to)}"
             style="display:inline-block;background:#d4af37;color:#0a0a0a;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:2px">
            Track Your Order
          </a>
        </p>
        <p style="color:#666;font-size:12px;margin-top:40px">Reine Luxe Co. · support@reineluxe.com</p>
      </div>
    `,
    })

    console.log('[Email] sendOrderStatusUpdate success:', {
      messageId: result.messageId,
      to,
      status
    })

    return result
  } catch (error) {
    console.error('[Email] sendOrderStatusUpdate error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      to,
      status,
      customerName,
      reference
    })
    throw error
  }
}


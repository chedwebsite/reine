import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await transporter.sendMail({
    from: `"Reine Luxe" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="font-family:serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-size:28px;letter-spacing:4px">REINE LUXE</h1>
        <h2>New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:bold">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0;font-weight:bold">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0;font-weight:bold">${phone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${message.replace(/\n/g, '<br/>')}</td></tr>
        </table>
        <p style="color:#666;font-size:12px;margin-top:40px">Reine Luxe Co. · support@reineluxe.com</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}

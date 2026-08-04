import Navbar from '@/components/navbar'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">LEGAL</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: '1. Information We Collect',
              body: 'We collect information you provide directly to us, such as your name, email address, phone number, shipping address, and payment information when you create an account or place an order. We also collect usage data such as pages visited, browser type, and IP address.',
            },
            {
              title: '2. How We Use Your Information',
              body: 'We use your information to process orders, send order confirmations and shipping updates, respond to your enquiries, personalise your shopping experience, and send marketing communications (with your consent).',
            },
            {
              title: '3. Sharing Your Information',
              body: 'We do not sell your personal data. We share information only with trusted service providers (e.g. payment processors, delivery partners) who assist in operating our platform, and only to the extent necessary to provide those services.',
            },
            {
              title: '4. Payment Security',
              body: 'All payments are processed securely by Paystack. We do not store your card details on our servers. Paystack is PCI-DSS compliant.',
            },
            {
              title: '5. Cookies',
              body: 'We use cookies to improve your browsing experience, remember your preferences, and analyse site traffic. See our Cookie Policy for details.',
            },
            {
              title: '6. Your Rights',
              body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@reineluxe.com.',
            },
            {
              title: '7. Data Retention',
              body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.',
            },
            {
              title: '8. Contact Us',
              body: 'For privacy-related enquiries, email us at privacy@reineluxe.com or write to: Reine Luxe Co., Lagos, Nigeria.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-base font-display font-semibold text-foreground mb-2">{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

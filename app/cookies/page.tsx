import Navbar from '@/components/navbar'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">LEGAL</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: 'What Are Cookies?',
              body: 'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.',
            },
            {
              title: 'How We Use Cookies',
              body: 'We use cookies to keep you signed in, remember your cart contents, understand how you use our site (analytics), and show you relevant content.',
            },
            {
              title: 'Types of Cookies We Use',
              body: 'Essential cookies: Required for the site to function (e.g. authentication, cart). Analytics cookies: Help us understand site usage via anonymised data. Preference cookies: Remember your settings and preferences.',
            },
            {
              title: 'Third-Party Cookies',
              body: 'Our payment provider Paystack may set cookies during the checkout process. We do not control these cookies — please refer to Paystack\'s privacy policy for details.',
            },
            {
              title: 'Managing Cookies',
              body: 'You can control cookies through your browser settings. Disabling essential cookies may affect site functionality such as staying logged in or maintaining your cart.',
            },
            {
              title: 'Contact',
              body: 'For questions about our use of cookies, contact us at privacy@reineluxe.com.',
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

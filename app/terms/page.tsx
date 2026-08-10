export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">LEGAL</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 2025</p>
        </div>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using the Reine Luxe Co. website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
            },
            {
              title: '2. Use of the Site',
              body: 'You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of others. You must not attempt to gain unauthorised access to any part of the site.',
            },
            {
              title: '3. Account Responsibility',
              body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use.',
            },
            {
              title: '4. Orders and Pricing',
              body: 'All prices are displayed in Nigerian Naira (₦) and are subject to change without notice. We reserve the right to cancel or refuse any order at our discretion, including in cases of pricing errors.',
            },
            {
              title: '5. Intellectual Property',
              body: 'All content on this site — including images, text, logos, and design — is the property of Reine Luxe Co. and may not be reproduced without written permission.',
            },
            {
              title: '6. Limitation of Liability',
              body: 'Reine Luxe Co. shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or purchase of products.',
            },
            {
              title: '7. Governing Law',
              body: 'These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State.',
            },
            {
              title: '8. Changes to Terms',
              body: 'We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.',
            },
            {
              title: '9. Contact',
              body: 'For questions about these terms, contact us at legal@reineluxe.com.',
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

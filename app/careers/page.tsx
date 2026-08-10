import Link from 'next/link'

const openings = [
  { title: 'Senior Fashion Buyer', dept: 'Merchandising', location: 'Lagos, Nigeria', type: 'Full-time' },
  { title: 'Brand Marketing Manager', dept: 'Marketing', location: 'Lagos, Nigeria', type: 'Full-time' },
  { title: 'E-commerce Specialist', dept: 'Digital', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Experience Lead', dept: 'Operations', location: 'Lagos, Nigeria', type: 'Full-time' },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">JOIN US</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-6">Careers at Reine Luxe</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of luxury fashion in Africa. Join a team that values creativity, excellence, and authenticity.
          </p>
        </div>

        <div className="space-y-4 mb-16">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-6">Open Positions</h2>
          {openings.map((job) => (
            <div key={job.title} className="border border-border rounded-sm p-6 bg-secondary/20 hover:border-accent transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">{job.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{job.dept} · {job.location} · {job.type}</p>
              </div>
              <Link
                href={`/contact?subject=Application: ${encodeURIComponent(job.title)}`}
                className="shrink-0 px-5 py-2 bg-accent text-[#0a0a0a] rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-12 text-center">
          <p className="text-muted-foreground mb-4">Don't see a role that fits? We'd still love to hear from you.</p>
          <Link href="/contact" className="text-accent hover:text-accent/80 font-body font-semibold">
            Send us your CV →
          </Link>
        </div>
      </div>
    </main>
  )
}

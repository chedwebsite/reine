const defaultItems = ['Haute Couture', 'Fine Jewelry', 'Accessories', 'Limited Editions', 'Ready-to-Wear']

/**
 * Slow scrolling brand marquee — a signature of high-end storefronts.
 * Pure CSS animation (see `.marquee-track`), paused on hover and
 * disabled entirely under `prefers-reduced-motion`.
 */
export default function Marquee({ items = defaultItems }: { items?: string[] }) {
  const row = [...items, ...items] // doubled for a seamless loop

  return (
    <div
      className="relative overflow-hidden border-y border-[#1c1c1c] bg-[#0d0d0d] py-5 select-none"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max items-center">
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8 font-display font-light text-2xl sm:text-3xl text-[#2a2a2a] tracking-[0.22em] uppercase whitespace-nowrap">
              {item}
            </span>
            <span className="text-accent/40 text-sm" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
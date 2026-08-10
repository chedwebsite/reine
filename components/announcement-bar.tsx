'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const messages = [
  'Complimentary nationwide delivery on orders over ₦50,000',
  'New drops — Haute Couture & Jewelry have landed',
  'Members receive early access to limited editions',
]

/**
 * Slim top promo strip that rotates through messages — the same pattern
 * every top fashion brand runs above the nav. Respects reduced motion.
 */
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative bg-[#0a0a0a] border-b border-[#c9a84c22] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 h-9 flex items-center justify-center">
        <Sparkles size={11} className="text-accent mr-2 shrink-0" aria-hidden />
        <div className="relative flex-1 max-w-xl h-full" aria-live="polite">
          {messages.map((msg, i) => (
            <p
              key={msg}
              className={`absolute inset-0 flex items-center justify-center text-center text-[0.62rem] sm:text-xs font-body font-medium tracking-[0.18em] uppercase text-[#c9a84c] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                reduceMotion
                  ? i === index
                    ? 'opacity-100'
                    : 'hidden'
                  : i === index
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
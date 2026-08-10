'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type RevealVariant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in' | 'zoom'

const hiddenTransforms: Record<RevealVariant, string> = {
  'fade-up': 'translateY(28px)',
  'fade-in': 'none',
  'slide-left': 'translateX(-28px)',
  'slide-right': 'translateX(28px)',
  'scale-in': 'scale(0.96)',
  zoom: 'scale(1.06)',
}

interface RevealProps {
  children: ReactNode
  as?: any
  variant?: RevealVariant
  /** Transition delay in ms — use for stagger effects */
  delay?: number
  /** Transition duration in ms */
  duration?: number
  className?: string
  style?: CSSProperties
  /** Keep animating when it scrolls out of view (defaults to once-only) */
  once?: boolean
}

/**
 * Scroll-triggered reveal. Content stays hidden until it enters the
 * viewport, then animates in. Respects `prefers-reduced-motion` and
 * gracefully degrades to always-visible when JS/IntersectionObserver
 * is unavailable (see <noscript> fallback in app/layout.tsx).
 */
export default function Reveal({
  children,
  as = 'div',
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  className,
  style,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [motion, setMotion] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // No motion preference or no IntersectionObserver → show immediately
    if (prefersReduced.matches || typeof IntersectionObserver === 'undefined') {
      setMotion(false)
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          setVisible(false)
        }
      },
      // Trigger slightly before the element fully arrives on screen
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(el)

    // Content already in the viewport at mount gets revealed immediately,
    // so nothing above the fold ever sits blank.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setVisible(true)
      if (once) observer.unobserve(el)
    }

    return () => observer.disconnect()
  }, [once])

  const Tag = as ?? 'div'
  const hidden = motion && !visible

  const elementStyle: CSSProperties = {
    opacity: hidden ? 0 : 1,
    transform: hidden ? hiddenTransforms[variant] : 'none',
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    ...style,
  }

  return (
    <Tag
      ref={ref}
      style={elementStyle}
      className={`reveal ${className ?? ''}`}
      data-state={visible ? 'visible' : 'hidden'}
      data-variant={variant}
    >
      {children}
    </Tag>
  )
}
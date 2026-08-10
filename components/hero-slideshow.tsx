'use client'

import { useState, useEffect, useCallback } from 'react'

const slideshowImages = [
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&fit=crop',
    alt: 'Luxury fashion elegance',
  },
  {
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&fit=crop',
    alt: 'High-end fashion collection',
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&fit=crop',
    alt: 'Designer clothing showcase',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&fit=crop',
    alt: 'Luxury runway fashion',
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&fit=crop',
    alt: 'Premium fashion accessories',
  },
]

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length)
      setIsTransitioning(false)
    }, 800) // Match CSS transition duration
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <div className="absolute inset-0">
      {slideshowImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[800ms] ease-in-out ${
            index === currentIndex
              ? 'opacity-100 animate-ken-burns'
              : 'opacity-0 scale-105'
          }`}
          style={{
            backgroundImage: `url('${image.url}')`,
            zIndex: index === currentIndex ? 1 : 0,
          }}
          aria-hidden={index !== currentIndex}
        />
      ))}
    </div>
  )
}
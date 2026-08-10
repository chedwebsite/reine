import type { Product } from '@/lib/supabase'

interface ProductImageProps {
  product: Product
  alt?: string
  /** Extra classes for the outer wrapper (e.g. "absolute inset-0") */
  className?: string
}

/**
 * Product photo with the classic premium-card micro-interaction:
 * the primary image cross-fades to a second angle on hover
 * (when the product has additional images).
 */
export default function ProductImage({ product, alt, className }: ProductImageProps) {
  const hoverImage = product.images?.[0]?.url
  const hasSecond = hoverImage && hoverImage !== product.image

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <img
        src={product.image}
        alt={alt ?? product.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
      />
      {hasSecond && (
        <img
          src={hoverImage}
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
      )}
    </div>
  )
}
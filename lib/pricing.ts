/**
 * Sale pricing for Reine Luxe Co.
 *
 * A product is "on sale" when it has an explicit `sale_price` stored on the
 * products table (managed by admins on /admin/products). This module is the
 * single source of truth for sale pricing so the price a customer sees on any
 * page is exactly the price stored in the cart and charged at checkout.
 */

export const SALE_DISCOUNT_PERCENT = 25

export interface Priceable {
  price: number
  sale_price?: number | null
}

/**
 * Flat 25% off calculator — used to seed/backfill suggested sale prices
 * (see supabase/alter_products_add_sale_price.sql).
 */
export function salePrice(price: number): number {
  return Math.round(price * (1 - SALE_DISCOUNT_PERCENT / 100))
}

/** True when the product has a valid explicit sale price below its list price. */
export function isOnSale(product: Priceable): boolean {
  return (
    typeof product.sale_price === 'number' &&
    Number.isFinite(product.sale_price) &&
    product.sale_price > 0 &&
    product.sale_price < product.price
  )
}

/** The price the customer should actually pay (sale price when on sale). */
export function effectivePrice(product: Priceable): number {
  return isOnSale(product) ? (product.sale_price as number) : product.price
}

/** Rounded percentage discount for an on-sale product, e.g. 25 → "25% OFF". */
export function discountPercent(product: Priceable): number {
  if (!isOnSale(product)) return 0
  return Math.round((1 - (product.sale_price as number) / product.price) * 100)
}
'use client'

import { createClient } from '@/lib/supabase-browser'

/**
 * Storage bucket that holds admin-uploaded product images.
 * It must be created in Supabase with admin-only write access — run
 * `supabase/storage_setup.sql` in the SQL editor first.
 */
export const PRODUCT_IMAGES_BUCKET = 'product-images'

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 * Uses the same authenticated browser Supabase client as the rest of the app,
 * so the upload only succeeds for users whose UID is in the `admin_users`
 * table (enforced by the bucket's RLS policies).
 */
export async function uploadProductImage(file: File, folder = 'products'): Promise<string> {
  const supabase = createClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  // Unique, non-predictable filename to avoid collisions / overwrites
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`
  const path = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { upsert: false, cacheControl: '3600', contentType: file.type })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

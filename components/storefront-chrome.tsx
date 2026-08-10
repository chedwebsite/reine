'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AnnouncementBar from '@/components/announcement-bar'

/**
 * Renders the storefront Navbar and Footer around page content.
 *
 * The Navbar and Footer are intentionally hidden on the `/admin` routes
 * because those pages have their own dedicated admin layout/sidebar.
 */
export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
    </>
  )
}

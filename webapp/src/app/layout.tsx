import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import CartModal from '@/components/CartModal'
import CartToast from '@/components/CartToast'

export const metadata: Metadata = {
  title: 'Cellular Renewal Therapy | Nanucell Medical',
  description: 'Physician-formulated NMN therapy for cellular renewal. Trusted by 1,000+ patients with clinically guided protocols.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          {children}
          <CartModal />
          <CartToast />
        </CartProvider>
      </body>
    </html>
  )
}

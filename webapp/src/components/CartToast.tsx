'use client'

import { useCart } from '@/context/CartContext'
import Toast from './Toast'

export default function CartToast() {
  const { toast, hideToast } = useCart()

  return (
    <Toast
      message={toast.message}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  )
}

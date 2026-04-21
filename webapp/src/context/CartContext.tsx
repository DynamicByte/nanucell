'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, getProductById } from '@/data/products'

export type CartItem = {
  productId: string
  quantity: number
}

type ToastState = {
  isVisible: boolean
  message: string
}

type CartContextType = {
  items: CartItem[]
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getCartItemsWithProducts: () => (CartItem & { product: Product })[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  toast: ToastState
  showToast: (message: string) => void
  hideToast: () => void
  referralCode: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'nanucell-cart'
const REFERRAL_STORAGE_KEY = 'nanucell-referral'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [toast, setToast] = useState<ToastState>({ isVisible: false, message: '' })
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
      }
    }

    // Check for referral code in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const refFromUrl = urlParams.get('ref')
    if (refFromUrl) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, refFromUrl)
      setReferralCode(refFromUrl)
    } else {
      const storedRef = localStorage.getItem(REFERRAL_STORAGE_KEY)
      if (storedRef) {
        setReferralCode(storedRef)
      }
    }

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isInitialized])

  const showToast = (message: string) => {
    setToast({ isVisible: true, message })
  }

  const hideToast = () => {
    setToast({ isVisible: false, message: '' })
  }

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = getProductById(productId)
    setItems(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { productId, quantity }]
    })
    if (product) {
      showToast(`${product.title} added to cart!`)
    }
  }

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const product = getProductById(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const getCartItemsWithProducts = () => {
    return items
      .map(item => {
        const product = getProductById(item.productId)
        if (!product) return null
        return { ...item, product }
      })
      .filter((item): item is CartItem & { product: Product } => item !== null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getCartItemsWithProducts,
        isCartOpen,
        setIsCartOpen,
        toast,
        showToast,
        hideToast,
        referralCode,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

'use client'

import Image from 'next/image'
import { Product } from '@/data/products'
import { useCart } from '@/context/CartContext'

type ChatProductCardProps = {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ChatProductCard({ product, onAddToCart }: ChatProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product.id)
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-48 flex-shrink-0">
      <div className="relative h-24 w-full">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">{product.category}</p>
        <h5 className="text-sm font-semibold text-slate-900 truncate">{product.title}</h5>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-slate-900">{product.priceDisplay}</span>
          <button
            onClick={handleAddToCart}
            className="px-2 py-1 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

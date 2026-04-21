'use client'

import Image from 'next/image'
import { products } from '@/data/products'
import { useCart } from '@/context/CartContext'

export default function Products() {
  const { addToCart } = useCart()

  return (
    <section id="products" className="max-w-6xl mx-auto px-6">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Clinical formulations</p>
        <h3 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight">Complementary therapeutics</h3>
        <p className="text-base md:text-lg text-slate-600">
          Each formula is meticulously dosed to align with Nanucell protocols, addressing detoxification, metabolic reset, and
          ongoing cellular defense.
        </p>
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <article key={product.id} className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
            <div className="relative h-52 w-full">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-[0.3em]">{product.category}</p>
              <h4 className="text-xl font-semibold text-slate-900">{product.title}</h4>
              <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">{product.priceDisplay}</span>
                <button
                  onClick={() => addToCart(product.id)}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors text-xs"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

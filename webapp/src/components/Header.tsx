'use client'

import Link from 'next/link'
import CartIcon from './CartIcon'

export default function Header() {
  return (
    <header className="hero-gradient text-white">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border border-white/20 flex items-center justify-center bg-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="uppercase tracking-[0.45em] text-xs text-purple-200/80">Nanucell Medical</p>
            <h1 className="text-xl font-semibold tracking-tight">Cellular Renewal Therapy</h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-purple-100/90">
          <Link href="#overview" className="hover:text-white transition">Overview</Link>
          <Link href="#science" className="hover:text-white transition">Clinical Science</Link>
          <Link href="#protocol" className="hover:text-white transition">Treatment Protocol</Link>
          <Link href="#products" className="hover:text-white transition">Formulations</Link>
          <Link href="#reviews" className="hover:text-white transition">Outcomes</Link>
          <Link href="/track" className="hover:text-white transition">Track Order</Link>
          <div className="text-white">
            <CartIcon />
          </div>
          <Link href="#consult" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 shadow-lg">
            Book Consultation
          </Link>
        </nav>
      </div>
    </header>
  )
}

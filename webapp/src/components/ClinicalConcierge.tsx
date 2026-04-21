'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getProductById, Product } from '@/data/products'
import ChatProductCard from './ChatProductCard'
import { useCart } from '@/context/CartContext'

type Message = {
  id: number
  text: string
  sender: 'user' | 'ai' | 'system'
  recommendedProducts?: string[]
  isCartSummary?: boolean
}

const expertiseAreas = [
  { id: 'anti-aging', label: 'Anti-Aging & Longevity', icon: '🧬' },
  { id: 'metabolic', label: 'Metabolic Health', icon: '⚡' },
  { id: 'immune', label: 'Immune Support', icon: '🛡️' },
  { id: 'detox', label: 'Detox & Skin Health', icon: '✨' },
]

export default function ClinicalConcierge() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello po! Ako si Dr. CJ, your Nanucell clinical concierge. Paano kita matutulungan today? Pwede kang pumili ng expertise area sa baba, o mag-type ka lang ng tanong mo!", sender: 'ai' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const { getCartCount, getCartTotal, setIsCartOpen } = useCart()

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  const handleProductAddedToCart = (product: Product) => {
    const cartCount = getCartCount() + 1
    const cartTotal = getCartTotal() + product.price
    
    const cartSummaryMessage: Message = {
      id: Date.now(),
      text: `Added ${product.title} to cart! You now have ${cartCount} item${cartCount > 1 ? 's' : ''} (${formatPrice(cartTotal)}).`,
      sender: 'system',
      isCartSummary: true,
    }
    setMessages(prev => [...prev, cartSummaryMessage])
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendToAI = async (newMessages: Message[], expertise: string | null) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(1).map(m => ({ text: m.text, sender: m.sender })),
          expertise,
        }),
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()
      const aiResponse: Message = {
        id: newMessages.length + 1,
        text: data.response,
        sender: 'ai',
        recommendedProducts: data.recommendedProducts || [],
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: newMessages.length + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again or fill out the consultation form for assistance.",
        sender: 'ai',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendedProducts = (productIds: string[]): Product[] => {
    return productIds
      .map(id => getProductById(id))
      .filter((p): p is Product => p !== undefined)
  }

  const handleExpertiseClick = (expertiseId: string) => {
    if (isLoading) return
    setSelectedExpertise(expertiseId)
    const expertise = expertiseAreas.find(e => e.id === expertiseId)
    if (expertise) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: `I'm interested in ${expertise.label}`,
        sender: 'user'
      }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      sendToAI(newMessages, expertiseId)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    sendToAI(newMessages, selectedExpertise)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <section id="clinical-concierge" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-10">
        <p className="text-purple-600 font-semibold tracking-widest text-xs uppercase">Clinical Concierge</p>
        <h2 className="section-title text-3xl md:text-4xl text-slate-900 leading-tight mt-3">
          Chat with Dr. CJ, Your AI Health Guide
        </h2>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
          Get personalized product recommendations and answers to your health questions from our AI-powered clinical concierge.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left Column - Dr. CJ Profile & Menu */}
        <div className="md:col-span-1 rounded-3xl bg-white p-6 md:p-8 card-shadow">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-purple-100">
              <Image
                src="/bg/dr-cj.png"
                alt="Dr. CJ - Clinical Concierge"
                fill
                className="object-cover"
              />
            </div>
            <h4 className="text-2xl font-semibold text-slate-900 mt-4">Dr. CJ</h4>
            <p className="text-sm text-slate-600">AI Medical Concierge</p>
            <p className="text-xs text-slate-500 mt-2">Available 24/7 to assist you</p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Select Expertise Area</p>
            <div className="space-y-2">
              {expertiseAreas.map((expertise) => (
                <button
                  key={expertise.id}
                  onClick={() => handleExpertiseClick(expertise.id)}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedExpertise === expertise.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <span className="mr-2">{expertise.icon}</span>
                  {expertise.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center">
              Follow us on{' '}
              <Link href="https://www.facebook.com/nanucellonlineshop" target="_blank" rel="noopener" className="text-purple-600 hover:underline">
                Facebook
              </Link>
              {' '}&{' '}
              <Link href="https://m.me/nanucellonlineshop" target="_blank" rel="noopener" className="text-purple-600 hover:underline">
                Messenger
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Chat Box */}
        <div className="md:col-span-2 rounded-3xl bg-white p-6 md:p-8 card-shadow flex flex-col" style={{ minHeight: '600px' }}>
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-slate-50 rounded-xl p-4 space-y-3 mb-4" style={{ maxHeight: '480px' }}>
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.isCartSummary ? (
                  <div className="flex justify-start">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-2xl rounded-bl-md text-sm flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span>{message.text}</span>
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="ml-1 text-green-700 font-semibold underline hover:text-green-900"
                      >
                        View Cart
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                )}
                {message.recommendedProducts && message.recommendedProducts.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 pl-1">
                    {getRecommendedProducts(message.recommendedProducts).map(product => (
                      <ChatProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleProductAddedToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            )}

          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

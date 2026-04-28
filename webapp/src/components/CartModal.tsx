'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
// @ts-ignore
import { regions, provinces, cities, barangays } from 'select-philippines-address';
import { convertProvince, removeParentheses } from '@/lib/mappings';

type CustomerInfo = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  region: string
  barangay: string
  province: string
  notes: string
}

type PaymentMethod = 'paymongo' | 'cod'

export default function CartModal() {
  const {
    isCartOpen,
    setIsCartOpen,
    getCartItemsWithProducts,
    getCartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    referralCode,
  } = useCart()

  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    barangay: '',
    province: '',
    notes: '',
  })

  // Additional functions //
  const [regionData, setRegion] = useState<any[]>([]);
  const [provinceData, setProvince] = useState<any[]>([]);
  const [cityData, setCity] = useState<any[]>([]);
  const [barangayData, setBarangay] = useState<any[]>([]);

  const [regionAddr, setRegionAddr] = useState("");
  const [provinceAddr, setProvinceAddr] = useState("");
  const [cityAddr, setCityAddr] = useState("");
  const [barangayAddr, setBarangayAddr] = useState("");

  const [shippingFee, setShippingFee] = useState<number>(110);
  const [loadingRate, setLoadingRate] = useState<boolean>(false);

  const region = () => {
    regions().then((response: any[]) => {
      setRegion(response);

      setRegionAddr("");
      setProvinceAddr("");
      setCityAddr("");
      setBarangayAddr("");

      setCustomerInfo(prev => ({
        ...prev,
        region: "",
        province: "",
        city: "",
        barangay: "",
      }));
    });
  };

  const province = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const text = e.target.selectedOptions[0].text;

    setRegionAddr(text);

    setCustomerInfo(prev => ({
      ...prev,
      region: text,
    }));

    provinces(e.target.value).then((response: any[]) => {
      setProvince(response);
      setCity([]);
      setBarangay([]);

      setCityAddr("");
      setBarangayAddr("");
    });
  };

  const city = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const text = e.target.selectedOptions[0].text;

    setProvinceAddr(text);

    setCustomerInfo(prev => ({
      ...prev,
      province: text,
    }));

    cities(e.target.value).then((response: any[]) => {
      setCity(response);
      setBarangayAddr("");
    });
  };

  const barangay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const text = e.target.selectedOptions[0].text;

    setCityAddr(text);

    setCustomerInfo(prev => ({
      ...prev,
      city: text,
    }));

    barangays(e.target.value).then((response: any[]) => {
      setBarangay(response);
    });
  };

  const brgy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brgyName = e.target.selectedOptions[0].text;

    setBarangayAddr(brgyName);

    setCustomerInfo(prev => ({
      ...prev,
      barangay: brgyName,
    }));

    fetchRate({
      province: convertProvince(provinceAddr),
      municipality: removeParentheses(cityAddr),
      barangay: brgyName,
    });
  };

  useEffect(() => {
    region()
  }, [])

  const fetchRate = async (recipient: { province: string; municipality: string; barangay: string; }) => {
    setLoadingRate(true);

    try {
      const res = await fetch("/api/philex/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          recipient,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setShippingFee(data.rate?.results?.fees?.total_rate);
    } catch (err) {
      console.error(err);
      setShippingFee(100);
    } finally {
      setLoadingRate(false);
    }
  };

  const cartItems = getCartItemsWithProducts()
  const subtotal = getCartTotal()
  const total = subtotal + shippingFee;

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString()}`
  }

  type InputChange =
    | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    | { target: { name: string; value: string } };

  const handleInputChange = (e: InputChange) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !cityAddr) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      if (paymentMethod === 'paymongo') {
        const response = await fetch('/api/paymongo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              name: item.product.title,
            })),
            customerInfo,
            total,
            referralCode,
          }),
        })

        const data = await response.json()

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          throw new Error(data.error || 'Failed to create checkout session')
        }
      } else {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              name: item.product.title,
            })),
            customerInfo,
            total,
            paymentMethod: 'cod',
            referralCode,
          }),
        })

        const data = await response.json()

        if (data.success) {
          clearCart()
          setIsCartOpen(false)
          setStep('cart')
          alert('Order placed successfully! We will contact you to confirm your order.')
        } else {
          throw new Error(data.error || 'Failed to place order')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900">
              {step === 'cart' ? 'Your Cart' : 'Checkout'}
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' ? (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-slate-300 mb-4">
                      <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                    </svg>
                    <p className="text-slate-500">Your cart is empty</p>
                    <p className="text-sm text-slate-400 mt-1">Add products from the chat or products section</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.productId} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{item.product.title}</h4>
                          <p className="text-sm text-purple-600 font-medium">{item.product.priceDisplay}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="ml-auto text-red-500 hover:text-red-600 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    placeholder="House/Unit No., Street, Barangay"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <select
                      name="region"
                      onChange={province}
                      defaultValue={""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm">
                      <option value="" disabled>Select Region</option>
                      {
                        regionData && regionData.length > 0 && regionData.map((item) => (
                          <option
                            key={item.region_code}
                            value={item.region_code}>
                            {item.region_name}
                          </option>))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <select
                      name="province"
                      onChange={city}
                      disabled={!regionAddr}
                      defaultValue={""}
                      className="w-full px-4 py-3 border disabled:bg-slate-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm">
                      <option value="" disabled>Select Province</option>
                      {
                        provinceData && provinceData.length > 0 && provinceData.map((item) => (<option
                          key={item.province_code} value={item.province_code}>{item.province_name}</option>))
                      }
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                      name="city"
                      onChange={barangay}
                      disabled={!provinceAddr}
                      defaultValue={""}
                      className="w-full px-4 py-3 border disabled:bg-slate-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm">
                      <option value="" disabled>Select City</option>
                      {
                        cityData && cityData.length > 0 && cityData.map((item) => (<option
                          key={item.city_code} value={item.city_code}>{item.city_name}</option>))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                    <select
                      name="barangay"
                      onChange={brgy}
                      disabled={!cityAddr}
                      defaultValue={""}
                      className="w-full px-4 py-3 border disabled:bg-slate-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm">
                      <option value="" disabled>Select Barangay</option>
                      {
                        barangayData && barangayData.length > 0 && barangayData.map((item) => (<option
                          key={item.brgy_code} value={item.brgy_code}>{item.brgy_name}</option>))
                      }
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Notes</label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                    placeholder="Any special instructions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <div className="p-3 rounded-xl border-2 border-purple-600 bg-purple-50 text-purple-700 text-sm font-medium">
                    💵 Cash on Delivery
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-slate-700">Total</span>
                <span className="text-slate-900">{formatPrice(total)}</span>
              </div>
              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('cart')}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

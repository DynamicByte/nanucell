'use client'

import { useState, useEffect } from 'react'

type Customer = {
  customer_name: string
  phone: string
  email: string | null
  order_count: number
  total_spent: number
  last_order: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      customer.customer_name.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower))
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">{customers.length} total customers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Total Spent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer, index) => (
                  <tr key={`${customer.phone}-${index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{customer.customer_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{customer.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {customer.order_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(customer.total_spent)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(customer.last_order)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

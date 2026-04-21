'use client'

import { useState } from 'react'

type TestResult = {
  success: boolean
  action?: string
  result?: unknown
  wouldSend?: unknown
  dryRun?: boolean
  packageType?: string
  error?: string
}

export default function TestPhilexPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev])
  }

  const testCalculateShipping = async () => {
    setIsLoading('calculate')
    try {
      const response = await fetch('/api/philex/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calculate' }),
      })
      const data = await response.json()
      addResult(data)
    } catch (error) {
      addResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(null)
    }
  }

  const testBooking = async (packageType: string, dryRun: boolean) => {
    setIsLoading(`${packageType}-${dryRun ? 'dry' : 'live'}`)
    try {
      const response = await fetch('/api/philex/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'book', packageType, dryRun }),
      })
      const data = await response.json()
      addResult(data)
    } catch (error) {
      addResult({ success: false, error: String(error) })
    } finally {
      setIsLoading(null)
    }
  }

  const clearResults = () => setResults([])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PhilEx API Test Page</h1>
          <p className="text-gray-600 mb-4">Test the PhilEx shipping integration on localhost</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Warning:</strong> &quot;Live Booking&quot; will create actual shipments in PhilEx. 
              Use &quot;Dry Run&quot; to preview what would be sent without creating real bookings.
            </p>
          </div>

          <div className="space-y-6">
            {/* Calculate Shipping */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3">1. Calculate Shipping Rates</h2>
              <p className="text-sm text-gray-600 mb-3">
                Tests shipping calculation for all package types (pouch, box, own package)
              </p>
              <button
                onClick={testCalculateShipping}
                disabled={isLoading !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading === 'calculate' ? 'Calculating...' : 'Calculate Shipping'}
              </button>
            </div>

            {/* Pouch Booking */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3">2. Test Pouch Booking (COD)</h2>
              <p className="text-sm text-gray-600 mb-3">
                Weight: 1kg | COD Amount: ₱1,500 | Description: 1x Ultima Stem Plus
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => testBooking('pouch', true)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {isLoading === 'pouch-dry' ? 'Testing...' : 'Dry Run (Preview)'}
                </button>
                <button
                  onClick={() => testBooking('pouch', false)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading === 'pouch-live' ? 'Creating...' : 'Live Booking'}
                </button>
              </div>
            </div>

            {/* Box Booking */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3">3. Test Box Booking (COD)</h2>
              <p className="text-sm text-gray-600 mb-3">
                Weight: 3kg | COD Amount: ₱3,000 | Description: 3x Nanucell Products
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => testBooking('box', true)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {isLoading === 'box-dry' ? 'Testing...' : 'Dry Run (Preview)'}
                </button>
                <button
                  onClick={() => testBooking('box', false)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading === 'box-live' ? 'Creating...' : 'Live Booking'}
                </button>
              </div>
            </div>

            {/* Own Package Booking */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-3">4. Test Own Package Booking (COD)</h2>
              <p className="text-sm text-gray-600 mb-3">
                Weight: 5kg | Dimensions: 20x15x10cm | COD Amount: ₱5,000 | Description: Bundle Package
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => testBooking('own_package', true)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {isLoading === 'own_package-dry' ? 'Testing...' : 'Dry Run (Preview)'}
                </button>
                <button
                  onClick={() => testBooking('own_package', false)}
                  disabled={isLoading !== null}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading === 'own_package-live' ? 'Creating...' : 'Live Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            {results.length > 0 && (
              <button
                onClick={clearResults}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test results yet. Run a test above.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </span>
                    {result.action && (
                      <span className="text-sm text-gray-600">
                        | {result.action} {result.packageType && `(${result.packageType})`}
                        {result.dryRun && ' - DRY RUN'}
                      </span>
                    )}
                  </div>
                  <pre className="text-xs bg-white/50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(result.error || result.wouldSend || result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

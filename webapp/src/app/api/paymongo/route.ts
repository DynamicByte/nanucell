import { NextRequest, NextResponse } from 'next/server'

type CartItem = {
  productId: string
  quantity: number
  price: number
  name: string
}

type CustomerInfo = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  notes: string
}

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo, total, referralCode } = await request.json() as {
      items: CartItem[]
      customerInfo: CustomerInfo
      total: number
      referralCode?: string
    }

    const secretKey = process.env.PAYMONGO_SECRET_KEY
    if (!secretKey) {
      console.error('PayMongo secret key not configured')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    const lineItems = items.map(item => ({
      currency: 'PHP',
      amount: item.price * 100,
      name: item.name,
      quantity: item.quantity,
    }))

    const checkoutData = {
      data: {
        attributes: {
          billing: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email || undefined,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              country: 'PH',
            },
          },
          send_email_receipt: !!customerInfo.email,
          show_description: true,
          show_line_items: true,
          description: `Nanucell Order - ${items.length} item(s)`,
          line_items: lineItems,
          payment_method_types: ['gcash', 'card', 'grab_pay', 'paymaya'],
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/#consult`,
          metadata: {
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_address: `${customerInfo.address}, ${customerInfo.city}`,
            order_notes: customerInfo.notes || '',
            referral_code: referralCode || '',
          },
        },
      },
    }

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(checkoutData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PayMongo API error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || 'Failed to create checkout session' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      checkoutUrl: data.data.attributes.checkout_url,
      sessionId: data.data.id,
    })
  } catch (error) {
    console.error('PayMongo checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment request' },
      { status: 500 }
    )
  }
}

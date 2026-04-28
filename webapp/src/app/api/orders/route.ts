import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createBooking, createCODBookingFromOrder } from '@/lib/philex'
import { convertProvince, convertRegion, removeParentheses } from '@/lib/mappings'

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
  province?: string
  barangay?: string
  region?: string
  notes: string
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo, total, paymentMethod, referralCode } = await request.json() as {
      items: CartItem[]
      customerInfo: CustomerInfo
      total: number
      paymentMethod: string
      referralCode?: string
    }

    const orderNumber = generateOrderNumber()

    let referrerId: string | null = null
    if (referralCode) {
      const { data: reseller } = await supabaseAdmin
        .from('resellers')
        .select('id')
        .eq('referral_code', referralCode)
        .eq('is_active', true)
        .single()
      if (reseller) {
        referrerId = reseller.id
      }
    }

    // Save order to Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || null,
        address: customerInfo.address,
        city: customerInfo.city,
        barangay: customerInfo.barangay,
        province: customerInfo.province,
        region: customerInfo.region,
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'pending',
        total,
        notes: customerInfo.notes || null,
        referrer_id: referrerId,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Save order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      type: 'order',
      message: `New ${paymentMethod.toUpperCase()} order ${orderNumber} (₱${total.toLocaleString()}) from ${customerInfo.name}`,
      reference_id: order.id,
    })

    // Create PhilEx booking for COD orders

    let philexBooking = null
    if (paymentMethod === 'cod') {
      try {
        const bookingRequest = createCODBookingFromOrder({
          orderId: order.id || '',
          orderNumber,
          customerName: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: removeParentheses(customerInfo.city ?? ''),
          province: convertProvince(customerInfo.province ?? ''),
          barangay: customerInfo.barangay,
          region: convertRegion(customerInfo.region ?? '').toLowerCase(),
          total,
          items: items.map(item => ({ name: item.name, quantity: item.quantity })),
          notes: customerInfo.notes,
        })

        const philexResult = await createBooking(bookingRequest)
        const booking = philexResult.results.bookings[0]

        philexBooking = {
          bookingId: philexResult.results.id,
          trackingNumber: booking?.tracking_number,
          status: booking?.booking_logs[0]?.status || 'Pending',
        }

        // Update order with PhilEx tracking info
        await supabaseAdmin
          .from('orders')
          .update({
            philex_booking_id: philexResult.results.id,
            philex_tracking_number: booking?.tracking_number,
            shipping_status: 'booked',
          })
          .eq('id', order.id)
      } catch (philexError) {
        console.error('PhilEx booking failed:', philexError)
        // Don't fail the order, just log the error
        // The booking can be created manually later
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id || '',
      orderNumber,
      // philexBooking,
      message: 'Order placed successfully',
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

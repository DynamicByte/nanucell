import { NextRequest, NextResponse } from 'next/server'
import {
  calculateShippingRate,
  createBooking,
  NANUCELL_PICKUP_ADDRESS,
  PhilexBookingRequest,
  PhilexPriceRequest,
} from '@/lib/philex'

const TEST_DELIVERY_ADDRESS = {
  type: 'delivery' as const,
  firstname: 'Juan',
  lastname: 'Dela Cruz',
  mobile_number: '09171234567',
  complete_address: '123 Test Street, Brgy. Sample',
  region: 'luzon',
  province: 'Bulacan',
  municipality: 'Calumpit',
  barangay: 'Balite',
  notes: 'Test order - please ignore',
}

export async function POST(request: NextRequest) {
  try {
    const { action, packageType, dryRun } = await request.json()

    // Test shipping calculation
    if (action === 'calculate') {
      const priceRequests: PhilexPriceRequest[] = [
        {
          type: 'pouch',
          weight: 1,
          declared_value: 1500,
          sender_province: process.env.NANUCELL_PROVINCE || 'Laguna',
          sender_municipality: process.env.NANUCELL_MUNICIPALITY || 'Cabuyao',
          sender_barangay: process.env.NANUCELL_BARANGAY || 'Gulod',
          recipient_province: 'Bulacan',
          recipient_municipality: 'Calumpit',
          recipient_barangay: 'Balite',
        },
        {
          type: 'box',
          weight: 3,
          declared_value: 3000,
          box_id: 1, // Small box - you may need to get actual box IDs from PhilEx
          sender_province: process.env.NANUCELL_PROVINCE || 'Laguna',
          sender_municipality: process.env.NANUCELL_MUNICIPALITY || 'Cabuyao',
          sender_barangay: process.env.NANUCELL_BARANGAY || 'Gulod',
          recipient_province: 'Bulacan',
          recipient_municipality: 'Calumpit',
          recipient_barangay: 'Balite',
        },
        {
          type: 'own package',
          weight: 5,
          declared_value: 5000,
          dimension: { length: 20, width: 15, height: 10 },
          sender_province: process.env.NANUCELL_PROVINCE || 'Laguna',
          sender_municipality: process.env.NANUCELL_MUNICIPALITY || 'Cabuyao',
          sender_barangay: process.env.NANUCELL_BARANGAY || 'Gulod',
          recipient_province: 'Bulacan',
          recipient_municipality: 'Calumpit',
          recipient_barangay: 'Balite',
        },
      ]

      const result = await calculateShippingRate(priceRequests)
      return NextResponse.json({
        success: true,
        action: 'calculate',
        result,
      })
    }

    // Test booking creation
    if (action === 'book') {
      let bookingRequest: PhilexBookingRequest

      const baseBooking = {
        declared_value: 1500,
        cod_payment: 1500,
        company_customer_id: `TEST-${Date.now()}`,
        affiliate_name: 'Nanucell Science',
        description: 'TEST ORDER - 1x Ultima Stem Plus',
        pickup_address: NANUCELL_PICKUP_ADDRESS,
        delivery_address: TEST_DELIVERY_ADDRESS,
      }

      switch (packageType) {
        case 'pouch':
          bookingRequest = {
            ...baseBooking,
            delivery_type: 'cod',
            type: 'pouch',
            weight: 1,
          }
          break

        case 'box':
          bookingRequest = {
            ...baseBooking,
            delivery_type: 'cod',
            type: 'box',
            weight: 3,
            box_price_id: 1, // You may need actual box_price_id from PhilEx
            declared_value: 3000,
            cod_payment: 3000,
            description: 'TEST ORDER - 3x Nanucell Products',
          }
          break

        case 'own_package':
          bookingRequest = {
            ...baseBooking,
            delivery_type: 'cod',
            type: 'own package',
            weight: 5,
            dimension: { length: 20, width: 15, height: 10 },
            declared_value: 5000,
            cod_payment: 5000,
            description: 'TEST ORDER - Bundle Package',
          }
          break

        default:
          return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
      }

      // If dry run, just return what would be sent (as array)
      if (dryRun) {
        return NextResponse.json({
          success: true,
          action: 'book',
          dryRun: true,
          packageType,
          wouldSend: [bookingRequest], // PhilEx expects array format
        })
      }

      // Actually create the booking (wrapped in array by createBooking function)
      const result = await createBooking([bookingRequest])
      return NextResponse.json({
        success: true,
        action: 'book',
        packageType,
        result,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('PhilEx test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

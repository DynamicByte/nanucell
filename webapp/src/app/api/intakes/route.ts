import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { data: intake, error } = await supabaseAdmin
      .from('medical_intakes')
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        region: data.region,
        package: data.package,
        consultation_type: data.consultation_type,
        health_goals: data.health_goals || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create intake:', error)
      return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
    }

    // Create notification for admin
    await supabaseAdmin.from('notifications').insert({
      type: 'intake',
      message: `New medical intake from ${data.full_name}`,
      reference_id: intake.id,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    })
  } catch (error) {
    console.error('Intake submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}

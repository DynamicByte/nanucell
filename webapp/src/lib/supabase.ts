import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export type IntakeStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type PaymentMethod = 'cod' | 'paymongo'
export type UserRole = 'superadmin' | 'admin' | 'user'

export type AdminUser = {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export type MedicalIntake = {
  id: string
  full_name: string
  phone: string
  email: string | null
  region: string
  package: string
  consultation_type: string
  health_goals: string | null
  status: IntakeStatus
  assigned_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  customer_name: string
  phone: string
  email: string | null
  address: string
  city: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  order_status: OrderStatus
  total: number
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
}

export type Notification = {
  id: string
  user_id: string | null
  type: 'intake' | 'order'
  message: string
  reference_id: string
  is_read: boolean
  created_at: string
}

export type Reseller = {
  id: string
  name: string
  referral_code: string
  is_active: boolean
  created_at: string
}

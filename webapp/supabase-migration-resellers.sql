-- Migration: Add Resellers feature
-- Run this in Supabase SQL Editor

-- Create resellers table
CREATE TABLE IF NOT EXISTS resellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referrer_id column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES resellers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resellers_referral_code ON resellers(referral_code);
CREATE INDEX IF NOT EXISTS idx_orders_referrer_id ON orders(referrer_id);

-- Enable RLS on resellers table
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;

-- Allow service role full access to resellers
CREATE POLICY "Service role can manage resellers" ON resellers
  FOR ALL
  USING (true)
  WITH CHECK (true);

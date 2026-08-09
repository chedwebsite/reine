-- Backfill tracking numbers for existing orders
-- Run this in your Supabase SQL Editor
-- Uses Paystack reference as the tracking number

-- Set tracking_number = paystack_reference for orders that don't have one
UPDATE orders
SET tracking_number = paystack_reference
WHERE tracking_number IS NULL
  OR tracking_number = '';

-- Verify the update
SELECT 
  id, 
  customer_email, 
  paystack_reference, 
  tracking_number,
  status
FROM orders
ORDER BY created_at DESC
LIMIT 10;

/*
  # Fix RLS policy on contact_requests

  1. Security Changes
    - Drop the overly permissive INSERT policy `Anyone can submit a contact request`
      which used `WITH CHECK (true)` allowing unrestricted inserts
    - Replace with `Public can submit valid contact requests` that validates
      required fields are non-empty and email contains @ symbol
    - This ensures only well-formed contact requests can be inserted while
      still allowing anonymous form submissions
*/

DROP POLICY IF EXISTS "Anyone can submit a contact request" ON contact_requests;

CREATE POLICY "Public can submit valid contact requests"
  ON contact_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(name)) > 0
    AND length(trim(email)) > 0
    AND email LIKE '%@%'
    AND length(trim(message)) > 0
  );

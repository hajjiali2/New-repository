/*
  # Create contact_requests table

  1. New Tables
    - `contact_requests`
      - `id` (uuid, primary key)
      - `name` (text, full name of requester)
      - `email` (text, email address)
      - `company` (text, optional company name)
      - `message` (text, message body)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `contact_requests` table
    - Allow anonymous insert (public contact form submission)
    - Only authenticated users can read contact requests (admin use)
*/

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact request"
  ON contact_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact requests"
  ON contact_requests
  FOR SELECT
  TO authenticated
  USING (true);

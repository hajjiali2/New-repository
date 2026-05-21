/*
  # Fix handle_new_user function security issues

  1. Changes
    - Set fixed search_path to prevent mutable search path attack
    - Revoke EXECUTE from anon and authenticated roles (function is a trigger, not an RPC endpoint)

  2. Security
    - Adds `SET search_path = ''` to lock the search path
    - Revokes public/anon/authenticated execute permissions since this is an internal trigger function only
*/

ALTER FUNCTION public.handle_new_user()
  SECURITY DEFINER
  SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

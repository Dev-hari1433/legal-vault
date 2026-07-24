import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/admin'];
const authPaths = ['/login', '/signup', '/forgot-password', '/verify-email'];

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  return supabaseResponse;
}

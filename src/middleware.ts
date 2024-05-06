import { NextRequest, NextResponse } from 'next/server';
import { useSession } from 'next-auth/react';
import { useGetSession } from './helpers/getSession';
import { getToken } from 'next-auth/jwt';
export { default } from 'next-auth/middleware';

const secret = process.env.NEXTAUTH_SECERT
export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};

export async function middleware(req: NextRequest) {
  const token=await getToken({req,secret})
  const url = req.nextUrl;
  console.log("this is middleware token",token)
  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}
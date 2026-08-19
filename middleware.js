import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/work/locked') {
    return NextResponse.next();
  }

  const isUnlocked = request.cookies.get('work_unlocked')?.value === '1';
  if (isUnlocked) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/work/locked';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/work', '/work/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token')?.value;
  const authRole = String(request.cookies.get('auth_role')?.value ?? '').toLowerCase();

  const isAuthenticated = Boolean(authToken);

  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && pathname === '/login') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = authRole === 'admin' ? '/users' : '/';
    return NextResponse.redirect(homeUrl);
  }

  const isProductRoute =
    pathname === '/' || pathname === '/add' || pathname.startsWith('/detail/');
  const isUserRoute = pathname === '/users' || pathname.startsWith('/user-detail/');

  if (isAuthenticated && authRole === 'admin' && isProductRoute) {
    const userUrl = request.nextUrl.clone();
    userUrl.pathname = '/users';
    return NextResponse.redirect(userUrl);
  }

  if (isAuthenticated && authRole === 'staff' && isUserRoute) {
    const productUrl = request.nextUrl.clone();
    productUrl.pathname = '/';
    return NextResponse.redirect(productUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

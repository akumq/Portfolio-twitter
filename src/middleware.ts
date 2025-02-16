import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(request) {
    const token = request.nextauth.token;
    console.log('Token dans le middleware:', token);

    // Vérifier si le chemin commence par /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Vérifier si l'utilisateur est admin
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/admin/:path*']
}; 
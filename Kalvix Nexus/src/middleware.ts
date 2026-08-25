import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/|_next/static/|_next/image/|favicon.ico).*)",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. store.kalvixnexus.com, store.localhost:3001)
  const hostname = req.headers.get("host") || "";
  
  // We need to define our base domains
  // For local development it's typically localhost:3001
  // For production it's kalvixnexus.com
  const isLocalhost = hostname.includes('localhost');
  const baseDomain = isLocalhost ? 'localhost:3001' : 'kalvixnexus.com';
  
  // Check if there is a subdomain
  // e.g. mystore.kalvixnexus.com -> mystore
  const subdomain = hostname.replace(`.${baseDomain}`, '');
  
  // If it's the main domain (or www), just proceed normally
  if (subdomain === hostname || subdomain === 'www' || subdomain === 'kalvixnexus.com') {
    return NextResponse.next();
  }
  
  // Rewrite to our dynamic route under /sites/[subdomain]/...
  // This completely isolates tenant routing from main app routing
  return NextResponse.rewrite(new URL(`/sites/${subdomain}${url.pathname}${url.search}`, req.url));
}

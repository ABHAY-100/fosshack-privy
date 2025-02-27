import { NextResponse } from "next/server";

export function csp() {
  const response = NextResponse.next();

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-{random_nonce}';
    style-src 'self' 'nonce-{random_nonce}' https://*.fontshare.com;
    img-src 'self' blob:;
    font-src 'self' https://*.fontshare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_URL} wss://*.onrender.com;
    upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: "/:path*",
};

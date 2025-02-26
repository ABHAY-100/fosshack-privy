import { NextResponse } from "next/server";

export function csp() {
  const response = NextResponse.next();

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://*.fontshare.com;
    img-src 'self' blob: data:;
    font-src 'self' https://*.fontshare.com;
    object-src 'self' data:;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_URL} wss://*.onrender.com https://*.ipify.org;
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

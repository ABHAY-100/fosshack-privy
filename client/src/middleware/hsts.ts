import { NextResponse } from "next/server";

export function middleware(_req: Request) {
  void _req;

  const res = NextResponse.next();

  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  return res;
}

export const config = {
  matcher: "/:path*",
};

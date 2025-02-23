import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

/** 
 * Metadata configuration for SEO and page information
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: "Privy",
  description: "Secure end-to-end encrypted chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Custom font loading for Clash Grotesk */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@1&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* antialiased class smooths font rendering */}
      <body className={`antialiased`}>
        {children}
        {/* Global toast notifications container */}
        <Toaster />
      </body>
    </html>
  );
}

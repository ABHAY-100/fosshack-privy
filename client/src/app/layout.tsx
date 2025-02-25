import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Privy - Safe & Anonymous Chat Platform",
  description:
    "Connect with people worldwide through private, anonymous conversations. No registration, no data storage, just instant secure chats.",
  keywords: [
    "privy",
    "chat",
    "messaging",
    "encryption",
    "privacy",
    "anonymous",
    "secure",
    "chatroom",
    "chat platform",
    "privacy-focused",
    "anonymous messaging",
    "private chats",
    "secure messaging",
    "anonymous chats",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@1,2&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

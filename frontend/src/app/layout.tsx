import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartVenue OS",
  description: "Next-gen stadium crowd control & concession management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

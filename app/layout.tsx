import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay | A little more connected",
  description:
    "Explore mobile and home fiber plans with Relay, a fictional telecommunications brand created for Azure training.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

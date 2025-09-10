import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProviders } from "@/components/providers/AuthProviders";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Dcommern - Online Shopping Platform",
  description: "Your one-stop destination for online shopping. Browse thousands of products with fast delivery.",
  keywords: ["dcommern", "online shopping", "retail", "products", "marketplace"],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <AuthProviders>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProviders>
      </body>
    </html>
  );
}

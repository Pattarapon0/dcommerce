"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Marketplace</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Discover unique handcrafted products from talented sellers around the world. 
              Support small businesses and find one-of-a-kind items you won&apos;t find anywhere else.
            </p>
            
            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 flex-grow"
                  required
                />
                <Button type="submit" variant="default">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="text-gray-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-gray-300 hover:text-white transition-colors">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-300 hover:text-white transition-colors">
                  Special Deals
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-300 hover:text-white transition-colors">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Sell</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/sell/start" className="text-gray-300 hover:text-white transition-colors">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/sell/guide" className="text-gray-300 hover:text-white transition-colors">
                  Seller Guide
                </Link>
              </li>
              <li>
                <Link href="/sell/fees" className="text-gray-300 hover:text-white transition-colors">
                  Fees & Pricing
                </Link>
              </li>
              <li>
                <Link href="/seller-tools" className="text-gray-300 hover:text-white transition-colors">
                  Seller Tools
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-300 hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <span className="text-gray-300 cursor-not-allowed">
                  Contact Us
                </span>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges & Social */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-400">
                🔒 Secure Payments
              </div>
              <div className="text-sm text-gray-400">
                📦 Fast Shipping
              </div>
              <div className="text-sm text-gray-400">
                ↩️ Easy Returns
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow us:</span>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                📘 Facebook
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                📷 Instagram
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦 Twitter
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                📌 Pinterest
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Links & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

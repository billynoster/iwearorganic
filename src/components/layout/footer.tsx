'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram } from 'lucide-react';
import Link from 'next/link';
import { AppStoreBadge } from '@/components/ui/app-store-badge';

const XLogo = () => (
    <svg 
        className="h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        aria-hidden="true"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const AmericanFlagIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7410 3900"
      className="h-4 w-auto rounded-sm"
    >
      <path fill="#b22234" d="M0 0h7410v3900H0z" />
      <path
        d="M0 450h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0zm0 600h7410v300H0z"
        fill="#fff"
      />
      <path fill="#3c3b6e" d="M0 0h2964v2100H0z" />
    </svg>
  );


export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About & Social */}
          <div className="space-y-4 lg:col-span-1">
             <div className="font-headline text-xl font-medium tracking-tight text-primary-foreground sm:text-2xl">
                i wear organic
            </div>
            <p className="text-sm text-primary-foreground/80">
              i wear organic &mdash; made-to-order apparel, designed in Tennessee.
            </p>
            <div className="flex space-x-4">
              <Link href="https://x.com/iwearorganic" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground">
                <XLogo />
              </Link>
              <Link href="https://instagram.com/iwearorganic" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-primary-foreground/70 mb-2">Get the App</p>
              <AppStoreBadge size="sm" />
            </div>
          </div>

          {/* Links */}
           <div className="grid grid-cols-2 md:col-span-1 lg:col-span-2 gap-8">
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">About</Link></li>
                    <li><Link href="/careers" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Collaborate</Link></li>
                    <li><Link href="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Contact Us</Link></li>
                    <li><Link href="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Shop</Link></li>
                </ul>
             </div>
             <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                    <li><Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">Terms of Service</Link></li>
                </ul>
             </div>
           </div>


          {/* Subscribe */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Subscribe to our newsletter</h3>
            <p className="text-sm text-primary-foreground/80">Get the latest news and updates delivered to your inbox.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 flex-1" />
              <Button type="submit" variant="secondary">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
            <div className="flex items-center justify-center gap-2">
                <p>&copy; {new Date().getFullYear()} I Wear Organic. All rights reserved.</p>
                <AmericanFlagIcon />
            </div>
        </div>
      </div>
    </footer>
  );
}


'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Video } from 'lucide-react';
import { CartSheet } from '../shopping/cart-sheet';
import { UserNav } from './user-nav';
import { useUser } from '@/firebase';
import { AppStoreBadge, APP_STORE_URL } from '@/components/ui/app-store-badge';

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const isLoggedIn = !!user && !user.isAnonymous;
  const uploadHref = isLoggedIn ? "/creator/upload" : "/login";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center shrink-0 justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-4">
        <Logo />
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/shopping"
            className={cn(
              'text-sm font-medium tracking-tight transition-colors hover:text-primary',
              pathname === '/shopping' || pathname?.startsWith('/shopping/')
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            Collections
          </Link>
          
          <Link
            href="/discover"
            className={cn(
              'text-sm font-medium tracking-tight transition-colors hover:text-primary',
              pathname === '/discover' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Discover
          </Link>

          <Link
            href="/rescuing-pets"
            className={cn(
              'text-sm font-medium tracking-tight transition-colors hover:text-primary',
              pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Community
          </Link>
          <Link
            href="/about"
            className={cn(
              'text-sm font-medium tracking-tight transition-colors hover:text-primary',
              pathname === '/about' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center mr-1">
            <AppStoreBadge size="sm" />
          </div>
          <Link href={uploadHref} className="hidden sm:flex text-muted-foreground hover:text-primary mr-2" aria-label="Upload Video">
            <Video className="h-5 w-5" />
          </Link>
          <UserNav />
          <CartSheet />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-sm">
            <nav className="grid gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Logo />
              </Link>
              <Link
                href="/shopping"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/shopping' || pathname?.startsWith('/shopping/')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                Collections
              </Link>
              <Link
                href="/discover"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/discover' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Discover
              </Link>
              <Link
                href="/rescuing-pets"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Community
              </Link>
              <Link
                href="/about"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/about' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                About
              </Link>
              <Link
                href="/privacy"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/privacy' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/terms' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Terms
              </Link>
              <Link
                href={uploadHref}
                className={cn(
                  'text-xl font-medium tracking-tight transition-colors',
                  pathname === '/creator/upload' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Upload Video
              </Link>
              <div className="pt-6 border-t border-border mt-2 space-y-2">
                <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">Download the App</p>
                <AppStoreBadge size="md" />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

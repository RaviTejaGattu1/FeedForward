
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, LayoutDashboard, User, PackageCheck } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useListings } from '@/hooks/use-listings';

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings, isInitialized } = useListings();

  const handleSignOut = async () => {
    // In a real app with a backend, you'd call a sign-out endpoint.
    // For this mock app, we just clear the session.
    sessionStorage.removeItem('mockUserSessionEmail');
    router.push('/');
    router.refresh(); // Force a refresh to update the user state everywhere
  };

  const activePickups =
    user && isInitialized
      ? listings.filter(
          (l) => l.claimedBy === user.uid && l.status === 'approved'
        )
      : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">FeedForward</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {user && activePickups.length > 0 && (
              <>
                {activePickups.length === 1 ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/listings/${activePickups[0].id}`}>
                      <PackageCheck className="mr-2 h-4 w-4 text-primary animate-pulse" />
                      My Pickup
                    </Link>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PackageCheck className="mr-2 h-4 w-4 text-primary animate-pulse" />
                        My Pickups ({activePickups.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                       <DropdownMenuLabel>Active Pickups</DropdownMenuLabel>
                       <DropdownMenuSeparator />
                        {activePickups.map((pickup) => (
                           <DropdownMenuItem key={pickup.id} onClick={() => router.push(`/listings/${pickup.id}`)}>
                              {pickup.foodName}
                           </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL ?? ''}
                        alt={user.displayName ?? 'User'}
                      />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName ?? 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <UserCircle className="h-5 w-5 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

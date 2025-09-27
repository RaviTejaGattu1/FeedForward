'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { Button } from '@/components/ui/button';
import { AlertCircle, HandHeart, Search, List } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const userName = 'Alex'; // In a real app, this would come from user session
  const notifications = [
    {
      id: 1,
      text: 'The Community Shelter has claimed your listing for "Fresh Bread". Please approve the pickup.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Welcome back, {userName}!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Here&apos;s what you can do today.
          </p>

          {notifications.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Notifications
              </h2>
              <div className="mt-4 grid gap-4">
                {notifications.map((notification) => (
                  <Alert key={notification.id}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Claim Request</AlertTitle>
                    <AlertDescription>
                      {notification.text}
                      <Button size="sm" className="ml-4">
                        Approve
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <HandHeart className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Provide Food</CardTitle>
                  <CardDescription>
                    Have surplus food? List it here for those in need.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <Button className="w-full" asChild>
                    <Link href="/provide">I want to provide</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <Search className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Look for Food</CardTitle>
                  <CardDescription>
                    Find available food listings near you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <Button className="w-full" asChild>
                    <Link href="/search">I am looking for food</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <List className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Manage Listings</CardTitle>
                  <CardDescription>
                    View, edit, or remove your active food listings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                   <Button className="w-full" asChild>
                    <Link href="/listings">My Listings</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

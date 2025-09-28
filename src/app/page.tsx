
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { Button } from '@/components/ui/button';
import { Flame, Truck, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/stat-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MotivationalBlurb } from '@/components/motivational-blurb';

export default async function Home() {
  const stats = {
    foodDeliveredLbs: 10000,
    hungerMetKcal: 5000000,
    livesImpacted: 1000,
  };

  const apiKeyMissing = !process.env.GEMINI_API_KEY;

  const compactFormat = (num: number) =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Welcome to FeedForward
            </h1>
            <div className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
               <MotivationalBlurb />
            </div>
            {apiKeyMissing && (
                <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Missing API Key</AlertTitle>
                  <AlertDescription>
                    The generative AI features of this application are disabled. Please set your Gemini API key in the <code>.env</code> file. You can get a key from{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Google AI Studio
                    </a>.
                  </AlertDescription>
                </Alert>
            )}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 md:py-24 lg:py-32 border-y">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <StatCard
                icon={<Truck className="h-6 w-6 text-primary" />}
                title="Food Delivered"
                value={compactFormat(stats.foodDeliveredLbs)}
                description="lbs of food delivered"
              />
              <StatCard
                icon={<Flame className="h-6 w-6 text-primary" />}
                title="Hunger Met"
                value={compactFormat(stats.hungerMetKcal)}
                description="kcal of hunger met"
              />
              <StatCard
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Lives Impacted"
                value={compactFormat(stats.livesImpacted)}
                description="lives impacted"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              Join Our Mission
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-lg">
              Become a part of the solution. Register as a provider or
              recipient, or help us manage the network.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">Register Now</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">User Login</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}

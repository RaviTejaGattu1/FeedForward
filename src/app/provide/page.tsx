
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Upload, LogIn } from 'lucide-react';
import { generateRecipeSuggestion } from '@/ai/flows/recipe-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Balancer } from 'react-wrap-balancer';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoadScript } from '@react-google-maps/api';
import { LocationInput } from '@/components/location-input';
import { useListings } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const MAP_LIBRARIES = ['places'] as (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
)[];

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default function ProvidePage() {
  const { user, loading } = useAuth();
  const [foodName, setFoodName] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [address, setAddress] = useState('');
  const [isSuggestionAcknowledged, setIsSuggestionAcknowledged] =
    useState(false);
  const [recipeSuggestion, setRecipeSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addListing } = useListings();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded } = useLoadScript(
    googleMapsApiKey
      ? {
          googleMapsApiKey: googleMapsApiKey,
          libraries: MAP_LIBRARIES,
        }
      : { skip: true }
  );

  const isFormFilled = foodName && foodType && quantity && address;

  useEffect(() => {
    if (!foodName) return;
    const handler = setTimeout(() => {
      setIsGenerating(true);
      setRecipeSuggestion('');
      generateRecipeSuggestion({ foodItem: foodName })
        .then((result) => {
          setRecipeSuggestion(result.suggestion);
        })
        .catch((error) => {
          console.error('Error generating recipe suggestion:', error);
          if (!error.message.includes('GEMINI_API_KEY')) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description:
                'Could not generate a recipe suggestion at this time.',
            });
          }
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [foodName, toast]);

  const handleCreateListing = async () => {
    if (!isFormFilled) return;

    await addListing({
        foodName,
        foodType,
        quantity: parseInt(quantity, 10),
        address,
        weight,
        volume,
    });
    router.push('/listings');
  };

  const isCreateButtonActive = isFormFilled && (isSuggestionAcknowledged || !recipeSuggestion || isGenerating);

  if (loading) {
     return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!user && !loading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tighter">
              Create a Food Listing
            </CardTitle>
            <CardDescription>
              Fill in the details of the surplus food you want to provide.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="food-name">Food Name</Label>
                <Input
                  id="food-name"
                  placeholder="e.g., Sourdough Bread"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="food-type">Food Type</Label>
                <Input
                  id="food-type"
                  placeholder="e.g., Baked Goods"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag & drop images here, or click to upload
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Select Files
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (optional)</Label>
                <div className="flex">
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 5"
                    className="rounded-r-none"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <Input
                    aria-label="Weight unit"
                    placeholder="lbs"
                    className="rounded-l-none w-20"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="volume">Volume (optional)</Label>
                <div className="flex">
                  <Input
                    id="volume"
                    type="number"
                    placeholder="e.g., 2"
                    className="rounded-r-none"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                  <Input
                    aria-label="Volume unit"
                    placeholder="gallons"
                    className="rounded-l-none w-24"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
               {isClient && isLoaded && googleMapsApiKey ? (
                <LocationInput
                  value={address}
                  onValueChange={setAddress}
                  onLocationSelect={(lat, lng, formattedAddress) => {
                    setAddress(formattedAddress);
                  }}
                />
              ) : (
                <Input 
                  id="address"
                  placeholder="Enter address manually"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              )}
            </div>

            {recipeSuggestion && !isSuggestionAcknowledged && (
              <Alert className="bg-accent/20 border-accent/50">
                <Lightbulb className="h-4 w-4 text-accent" />
                <AlertTitle className="font-semibold text-accent">
                  Recipe Idea!
                </AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                  <Balancer>{recipeSuggestion}</Balancer>
                   {!isSuggestionAcknowledged && (
                    <Button
                      size="sm"
                      onClick={() => setIsSuggestionAcknowledged(true)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      Ok, Got it
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {isGenerating && !recipeSuggestion && (
              <Alert>
                <Lightbulb className="h-4 w-4 animate-pulse" />
                <AlertTitle>Thinking of a recipe...</AlertTitle>
                <AlertDescription>
                  Our AI is thinking of a simple recipe for your item.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardContent>
            <Button
              className={cn('w-full', {
                'bg-success text-success-foreground hover:bg-success/90':
                  isCreateButtonActive,
              })}
              disabled={!isCreateButtonActive}
              onClick={handleCreateListing}
              size="lg"
            >
              Create Food Listing
            </Button>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}

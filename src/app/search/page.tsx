
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import {
  CookingPot,
  MapPin,
  Search,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DynamicLocationInput } from '@/components/dynamic-location-input';

const mockListings = [
  {
    id: '1',
    foodName: 'Sourdough Bread',
    quantity: 10,
    address: '123 Main St, Anytown USA',
    distance: 2.5,
    imageUrl: PlaceHolderImages.find((img) => img.id === 'bread')
      ?.imageUrl as string,
    imageHint: PlaceHolderImages.find((img) => img.id === 'bread')
      ?.imageHint as string,
  },
  {
    id: '2',
    foodName: 'Organic Apples',
    quantity: 50,
    address: '456 Oak Ave, Anytown USA',
    distance: 3.1,
    imageUrl: PlaceHolderImages.find((img) => img.id === 'apples')
      ?.imageUrl as string,
    imageHint: PlaceHolderImages.find((img) => img.id === 'apples')
      ?.imageHint as string,
  },
  {
    id: '3',
    foodName: 'Canned Beans',
    quantity: 24,
    address: '789 Pine Ln, Anytown USA',
    distance: 4.2,
    imageUrl: PlaceHolderImages.find((img) => img.id === 'beans')
      ?.imageUrl as string,
    imageHint: PlaceHolderImages.find((img) => img.id === 'beans')
      ?.imageHint as string,
  },
    {
    id: '4',
    foodName: 'Fresh Milk',
    quantity: 12,
    address: '101 Maple Dr, Anytown USA',
    distance: 5.0,
    imageUrl: PlaceHolderImages.find((img) => img.id === 'milk')
      ?.imageUrl as string,
    imageHint: PlaceHolderImages.find((img) => img.id === 'milk')
      ?.imageHint as string,
  },
];

export default function SearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    // In a real app, you'd fetch listings based on the search criteria.
    // For now, we'll just simulate a search.
    setHasSearched(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {/* Search Form Section */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tighter">
                  Find Food Near You
                </CardTitle>
                <CardDescription>
                  Enter your location and preferences to find available food.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">My Location</Label>
                      <DynamicLocationInput
                        isGeolocateDefault={true}
                        value={location}
                        onValueChange={setLocation}
                        onLocationSelect={(lat, lng, formattedAddress) => {
                          setLocation(formattedAddress);
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="range">Find within range</Label>
                      <div className="flex gap-2">
                        <Input id="range" type="number" placeholder="5" />
                        <Select defaultValue="miles">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Units" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="miles">Miles</SelectItem>
                            <SelectItem value="km">Kilometers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                      <Label htmlFor="food-preferences">Food Preferences</Label>
                      <Input id="food-preferences" placeholder="e.g., Vegan, Gluten-Free" />
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="similar-foods">Foods Similar To</Label>
                      <Input id="similar-foods" placeholder="e.g., Rice, Pasta, Bread" />
                    </div>
                  </div>
                  <Button size="lg" className="w-full" onClick={handleSearch}>
                    <Search className="mr-2" /> Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Results Section */}
          {hasSearched && (
            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Available Listings
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockListings.map((listing) => (
                  <Card key={listing.id} className="flex flex-col overflow-hidden">
                    <div className="relative w-full h-48">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.foodName}
                        fill
                        className="object-cover"
                        data-ai-hint={listing.imageHint}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{listing.foodName}</CardTitle>
                      <CardDescription>{listing.address}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm flex-1">
                       <div className="flex items-center gap-2">
                         <CookingPot className="h-4 w-4 text-muted-foreground" />
                        <span>Quantity: {listing.quantity}</span>
                      </div>
                       <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{listing.distance} miles away</span>
                      </div>
                    </CardContent>
                     <CardContent className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link href={`/listings/${listing.id}`}>Details</Link>
                      </Button>
                      <Button variant="secondary" className="flex-1">Reserve</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>      <AppFooter />
    </div>
  );
}

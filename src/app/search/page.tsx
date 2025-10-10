
'use client';

import { useState, useEffect } from 'react';
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
import { CookingPot, MapPin, Search, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLoadScript } from '@react-google-maps/api';
import { LocationInput } from '@/components/location-input';
import { type Listing, useListings } from '@/hooks/use-listings';
import { getDistance } from 'geolib';

const MAP_LIBRARIES = ['places'] as (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
)[];

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const getCoordsFromAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error("Google Maps Geocoder not available.");
      return resolve(null);
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
        resolve(null);
      }
    });
  });
};

type ListingWithDistance = Listing & { distance?: number };

export default function SearchPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState('');
  const [range, setRange] = useState('5');
  const [rangeUnit, setRangeUnit] = useState('miles');
  const { listings, isInitialized } = useListings(); // Fetches all listings by default
  const [filteredListings, setFilteredListings] = useState<ListingWithDistance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useLoadScript(
    googleMapsApiKey
      ? {
          googleMapsApiKey,
          libraries: MAP_LIBRARIES,
        }
      : { skip: true }
  );

  useEffect(() => {
    // Initially show all active listings
    if (isInitialized) {
        setFilteredListings(listings.filter(l => l.status === 'active'));
    }
  }, [listings, isInitialized])

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setFilteredListings([]);

    if (!location) {
        // If no location, show all active listings
        setFilteredListings(listings.filter(l => l.status === 'active'));
        setIsSearching(false);
        return;
    }
    try {
        const userCoords = await getCoordsFromAddress(location);
        if (!userCoords) {
             setError("Could not find the location specified. Please try a different address.");
             setIsSearching(false);
             return;
        }
        
        const activeListings = listings.filter(l => l.status === 'active');
        
        const listingsWithDistance = await Promise.all(
            activeListings.map(async (listing) => {
                let listingCoords = 
                    listing.latitude && listing.longitude 
                    ? { lat: listing.latitude, lng: listing.longitude } 
                    : await getCoordsFromAddress(listing.address);
                
                if (!listingCoords) {
                    return { ...listing, distance: undefined };
                }

                const distanceInMeters = getDistance(
                    { latitude: userCoords.lat, longitude: userCoords.lng },
                    { latitude: listingCoords.lat, longitude: listingCoords.lng }
                );

                const distance = rangeUnit === 'miles' ? distanceInMeters / 1609.34 : distanceInMeters / 1000;
                return { ...listing, distance };
            })
        );
        
        const rangeInSelectedUnit = parseInt(range, 10);
        
        const nearbyListings = listingsWithDistance
          .filter(listing => listing.distance !== undefined && listing.distance <= rangeInSelectedUnit)
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

        setFilteredListings(nearbyListings);

    } catch (e) {
        console.error("Error during search:", e);
        setError("An unexpected error occurred during the search.");
        setFilteredListings([]);
    } finally {
        setIsSearching(false);
    }
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
                      {typeof window !== 'undefined' &&
                      isLoaded &&
                      googleMapsApiKey ? (
                        <LocationInput
                          value={location}
                          onValueChange={setLocation}
                          onLocationSelect={(lat, lng, formattedAddress) => {
                            setLocation(formattedAddress);
                          }}
                          onGeolocateError={setError}
                        />
                      ) : (
                        <Input
                          id="location"
                          placeholder="Enter your city or address"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="range">Find within range</Label>
                      <div className="flex gap-2">
                        <Input id="range" type="number" value={range} onChange={e => setRange(e.target.value)} />
                        <Select value={rangeUnit} onValueChange={setRangeUnit}>
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
                      <Label htmlFor="food-preferences">
                        Food Preferences
                      </Label>
                      <Input
                        id="food-preferences"
                        placeholder="e.g., Vegan, Gluten-Free"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="similar-foods">Foods Similar To</Label>
                      <Input
                        id="similar-foods"
                        placeholder="e.g., Rice, Pasta, Bread"
                      />
                    </div>
                  </div>
                  <Button size="lg" className="w-full" onClick={handleSearch} disabled={isSearching}>
                    <Search className="mr-2" /> {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {error && (
            <Alert variant="destructive" className="mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Search Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {(hasSearched || isInitialized) && (
            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                {hasSearched ? "Search Results" : "All Available Listings"}
              </h2>
               {filteredListings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredListings.map((listing) => (
                    <Card
                      key={listing.id}
                      className="flex flex-col overflow-hidden"
                    >
                      <div className="relative w-full h-48">
                        <Image
                          src={listing.imageUrl || PlaceHolderImages.find(img => img.id === 'beans')?.imageUrl || 'https://placehold.co/600x400'}
                          alt={listing.foodName}
                          fill
                          className="object-cover"
                          data-ai-hint="food item"
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
                          {listing.distance !== undefined ? (
                              <span>{listing.distance.toFixed(1)} {rangeUnit} away</span>
                          ) : (
                              <span>Distance unavailable</span>
                          )}
                        </div>
                      </CardContent>
                      <CardContent className="flex gap-2">
                        <Button className="flex-1" asChild>
                          <Link href={`/listings/${listing.id}`}>Details</Link>
                        </Button>
                        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/listings/${listing.id}`)}>
                          Reserve
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
               ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {isSearching 
                                ? "Searching for listings..." 
                                : hasSearched 
                                    ? "No active listings found matching your criteria. Try expanding your search range or changing your location." 
                                    : "There are currently no active listings."
                            }
                        </p>
                    </CardContent>
                </Card>
               )}
            </section>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

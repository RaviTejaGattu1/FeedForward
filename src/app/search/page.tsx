
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import { CookingPot, MapPin, Search, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLoadScript } from '@react-google-maps/api';
import { LocationInput } from '@/components/location-input';
import { type Listing, useListings } from '@/hooks/use-listings';
import { getDistance } from 'geolib';
import { getCoordsFromAddress } from '@/lib/geocoding';

const MAP_LIBRARIES = ['places'] as (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
)[];

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type ListingWithDistance = Listing & { distance?: number };

export default function SearchPage() {
  const router = useRouter();
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState('');
  const [range, setRange] = useState('10');
  const [rangeUnit, setRangeUnit] = useState('miles');
  const { listings: allListings, isInitialized } = useListings();
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
    // On initial load, or when allListings changes, show all active listings if no search has been performed yet.
    if (isInitialized && !hasSearched) {
        setFilteredListings(allListings.filter(l => l.status === 'active'));
    }
  }, [allListings, isInitialized, hasSearched]);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    setFilteredListings([]); // Clear previous results

    if (!location) {
        // If search is cleared, show all active listings without distance.
        setFilteredListings(allListings.filter(l => l.status === 'active'));
        setIsSearching(false);
        setHasSearched(false); // Reset search state
        return;
    }

    try {
        localStorage.setItem('lastSearchLocation', location);
        const userCoords = await getCoordsFromAddress(location);
        if (!userCoords) {
             setError("Could not find the location specified. Please try a different address.");
             setIsSearching(false);
             return;
        }
        
        const activeListings = allListings.filter(l => l.status === 'active');

        const listingsWithDistance: ListingWithDistance[] = activeListings
          .filter(listing => listing.latitude && listing.longitude) // Ensure listings have coordinates
          .map(listing => {
            const distanceInMeters = getDistance(
                { latitude: userCoords.lat, longitude: userCoords.lng },
                { latitude: listing.latitude!, longitude: listing.longitude! }
            );

            const distance = rangeUnit === 'miles' ? distanceInMeters / 1609.34 : distanceInMeters / 1000;
            return { ...listing, distance };
        });
        
        const rangeInSelectedUnit = parseInt(range, 10);
        
        const nearbyListings = listingsWithDistance
          .filter(listing => listing.distance !== undefined && listing.distance <= rangeInSelectedUnit)
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

        setFilteredListings(nearbyListings);

    } catch (e) {
        console.error("Error during search:", e);
        setError("An unexpected error occurred during the search.");
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
                      {isLoaded && googleMapsApiKey ? (
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
          {(isInitialized) && (
            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                {hasSearched && location ? "Search Results" : "All Available Listings"}
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
                          src={listing.imageUrl || 'https://placehold.co/600x400'}
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

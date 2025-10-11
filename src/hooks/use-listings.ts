
'use client';

import { useSyncExternalStore, useCallback, useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { getCoordsFromAddress } from '@/lib/geocoding';
import { createLocalStorageStore } from '@/lib/create-local-storage-store';

export type ListingStatus =
  | 'active'
  | 'receiver incoming'
  | 'approved'
  | 'awaiting approval'
  | 'delivered';

export type Listing = {
  id: string;
  foodName: string;
  foodType: string;
  quantity: number;
  weight?: string;
  volume?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  status: ListingStatus;
  claimedBy: string | null;
  createdAt: string; // Store as ISO string for localStorage
  userId: string;
};


// --- Store Implementation ---
const initialServerListings: Listing[] = [
    {
        id: 'mock-1',
        foodName: 'Sourdough Bread',
        foodType: 'Baked Goods',
        quantity: 5,
        address: '123 Main St, Anytown, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'active',
        claimedBy: null,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        userId: 'admin-user-id',
        imageUrl: 'https://images.unsplash.com/photo-1554933054-0b679a7982ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxicmVhZCUyMGxvYWZ8ZW58MHx8fHwxNzU4OTM0NjU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        id: 'mock-2',
        foodName: 'Fresh Apples',
        foodType: 'Produce',
        quantity: 20,
        address: '456 Oak Ave, Anytown, USA',
        latitude: 40.7228,
        longitude: -74.0160,
        status: 'awaiting approval',
        claimedBy: 'Community Shelter',
        createdAt: new Date(Date.now() - 3600 * 2000).toISOString(),
        userId: 'admin-user-id',
        imageUrl: 'https://images.unsplash.com/photo-1651774031696-1531123f9831?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxhcHBsZXMlMjBiYXNrZXR8ZW58MHx8fHwxNzU4OTUwNzkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        id: 'mock-3',
        foodName: 'Canned Beans',
        foodType: 'Pantry',
        quantity: 24,
        address: '201 S 4th St, San Jose, CA 95112, USA',
        latitude: 37.3352,
        longitude: -121.8811,
        status: 'active',
        claimedBy: null,
        createdAt: new Date(Date.now() - 3600 * 4000).toISOString(),
        userId: 'another-user-id',
        imageUrl: 'https://images.unsplash.com/photo-1626436273093-35351f1a7d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYW5uZWQlMjBiZWFuc3xlbnwwfHx8fDE3NTkwMTc1NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
];

const listingsStore = createLocalStorageStore<Listing[]>('mockListings', initialServerListings);

// --- React Hook ---
export function useListings(options: { forCurrentUser?: boolean } = {}) {
  const { forCurrentUser = false } = options;
  const { user } = useAuth();
  
  const allListings = useSyncExternalStore(listingsStore.subscribe, listingsStore.getSnapshot, listingsStore.getServerSnapshot);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  const listings = forCurrentUser && user
    ? allListings.filter(l => l.userId === user.uid)
    : allListings;
  
  const addListing = useCallback(
    async (
      newListingData: Omit<
        Listing,
        'id' | 'status' | 'claimedBy' | 'createdAt' | 'userId'
      >
    ) => {
      if (!user) {
        return;
      }

      let coords = {
          latitude: newListingData.latitude,
          longitude: newListingData.longitude
      };

      if ((!coords.latitude || !coords.longitude) && newListingData.address) {
          const geocodedCoords = await getCoordsFromAddress(newListingData.address);
          if (geocodedCoords) {
              coords.latitude = geocodedCoords.lat;
              coords.longitude = geocodedCoords.lng;
          }
      }

      const newListing: Listing = {
          ...newListingData,
          ...coords,
          id: `listing-${Date.now()}`,
          userId: user.uid,
          status: 'active',
          claimedBy: null,
          createdAt: new Date().toISOString(),
      }
      const currentListings = listingsStore.getSnapshot();
      listingsStore.setState([...currentListings, newListing]);
    },
    [user]
  );

  const updateListing = useCallback(
    async (listingId: string, updates: Partial<Omit<Listing, 'id' | 'userId' | 'createdAt'>>) => {
        const currentListings = listingsStore.getSnapshot();
        const updatedListings = currentListings.map(l => l.id === listingId ? { ...l, ...updates } : l);
        listingsStore.setState(updatedListings);
    },
    []
  );

  const removeListing = useCallback(
    async (listingId: string) => {
        const currentListings = listingsStore.getSnapshot();
        const updatedListings = currentListings.filter(l => l.id !== listingId);
        listingsStore.setState(updatedListings);
    },
    []
  );
  
  const getListingById = useCallback((listingId: string) => {
    return listingsStore.getSnapshot().find(l => l.id === listingId);
  }, []);

  return {
    listings,
    addListing,
    updateListing,
    removeListing,
    isInitialized,
    getListingById,
  };
}

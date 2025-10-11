
'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useAuth } from './use-auth';
import { getCoordsFromAddress } from '@/lib/geocoding';


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
// This is the single source of truth for our listings data.

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

let listingsStore: Listing[] = [...initialServerListings];

// A set of listeners to call when the store changes.
const listeners = new Set<() => void>();

function getListingsFromLocalStorage() {
    if (typeof window === 'undefined') {
        return [...initialServerListings];
    }
    try {
        const storedListings = localStorage.getItem('mockListings');
        if (storedListings) {
            return JSON.parse(storedListings);
        }
    } catch (e) {
        console.error("Failed to parse listings from localStorage", e);
    }
    // If nothing in localStorage, initialize it.
    localStorage.setItem('mockListings', JSON.stringify(initialServerListings));
    return [...initialServerListings];
}

// Initialize the store from localStorage
listingsStore = getListingsFromLocalStorage();


// Function to update the store and notify all listeners.
const setListings = (newListings: Listing[]) => {
  listingsStore = newListings;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockListings', JSON.stringify(listingsStore));
  }
  // Notify all subscribed components that the data has changed.
  listeners.forEach(listener => listener());
}

// Function for components to subscribe to changes.
const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// This handles changes from other tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'mockListings' && event.newValue) {
      try {
        const newListings = JSON.parse(event.newValue);
        // Only update if the data is actually different to avoid loops
        if (JSON.stringify(listingsStore) !== JSON.stringify(newListings)) {
           listingsStore = newListings;
           listeners.forEach(listener => listener());
        }
      } catch (e) {
        console.error("Failed to parse listings from storage event", e);
      }
    }
  });
}


// --- Store API ---
const listingsApi = {
  addListing: (newListing: Listing) => {
    setListings([...listingsStore, newListing]);
  },
  updateListing: (listingId: string, updates: Partial<Listing>) => {
    setListings(listingsStore.map(l => l.id === listingId ? { ...l, ...updates } : l));
  },
  removeListing: (listingId: string) => {
    setListings(listingsStore.filter(l => l.id !== listingId));
  },
  getListingById: (listingId: string): Listing | undefined => {
    const listing = listingsStore.find(l => l.id === listingId);
    return listing ? { ...listing } : undefined;
  },
  getAllListings: (): Listing[] => {
    return listingsStore;
  }
};


// --- React Hook ---
export function useListings(options: { forCurrentUser?: boolean } = {}) {
  const { forCurrentUser = false } = options;
  const { user } = useAuth();
  
  // useSyncExternalStore makes React aware of our external store.
  // It takes three arguments:
  // 1. subscribe: A function to register a callback that is called when the store changes.
  // 2. getSnapshot: A function that returns the current store value.
  // 3. getServerSnapshot: An optional function for server rendering.
  const allListings = useSyncExternalStore(subscribe, listingsApi.getAllListings, () => initialServerListings);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // When the component mounts on the client, we confirm initialization.
    // The store is already initialized from localStorage outside the hook.
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
      
      listingsApi.addListing(newListing);
    },
    [user]
  );

  const updateListing = useCallback(
    async (listingId: string, updates: Partial<Omit<Listing, 'id' | 'userId' | 'createdAt'>>) => {
        listingsApi.updateListing(listingId, updates);
    },
    []
  );

  const removeListing = useCallback(
    async (listingId: string) => {
        listingsApi.removeListing(listingId);
    },
    []
  );
  
  const getListingById = useCallback((listingId: string) => {
    return listingsApi.getListingById(listingId);
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

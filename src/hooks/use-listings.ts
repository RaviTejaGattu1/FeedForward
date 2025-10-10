
'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './use-auth';

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

// This is an in-browser store that uses localStorage and communicates changes between tabs.
let listingsStore: Listing[] = [];

// A set of listeners to call when the store changes.
const listeners = new Set<() => void>();

const getInitialListings = (): Listing[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const storedListings = localStorage.getItem('mockListings');
    if (storedListings) {
        try {
            return JSON.parse(storedListings);
        } catch (e) {
            console.error("Failed to parse listings from localStorage", e);
            return [];
        }
    }
    // Initial default data if localStorage is empty
    const initialListings: Listing[] = [
        {
            id: 'mock-1',
            foodName: 'Sourdough Bread',
            foodType: 'Baked Goods',
            quantity: 5,
            address: '123 Main St, Anytown',
            latitude: 40.7128,
            longitude: -74.0060,
            status: 'active',
            claimedBy: null,
            createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
            userId: 'admin-user-id',
        },
        {
            id: 'mock-2',
            foodName: 'Fresh Apples',
            foodType: 'Produce',
            quantity: 20,
            address: '456 Oak Ave, Anytown',
            latitude: 40.7228,
            longitude: -74.0160,
            status: 'awaiting approval',
            claimedBy: 'Community Shelter',
            createdAt: new Date(Date.now() - 3600 * 2000).toISOString(),
            userId: 'admin-user-id',
        }
    ];
    localStorage.setItem('mockListings', JSON.stringify(initialListings));
    return initialListings;
};

// Initialize the store from localStorage.
listingsStore = getInitialListings();

// Function to update the store and notify listeners.
const emitChange = () => {
  listeners.forEach(listener => listener());
}

// Update the store and localStorage.
const setListings = (listings: Listing[]) => {
  listingsStore = listings;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockListings', JSON.stringify(listings));
  }
  emitChange();
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
        listingsStore = JSON.parse(event.newValue);
        emitChange();
      } catch (e) {
        console.error("Failed to parse listings from storage event", e);
      }
    }
  });
}

// --- Public API for the store ---
export const listingsApi = {
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
    return listingsStore.find(l => l.id === listingId);
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
  const allListings = useSyncExternalStore(subscribe, listingsApi.getAllListings, listingsApi.getAllListings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // The store is now initialized outside the hook, but we can keep this for consumers.
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
        // This case is handled in the UI, but it's good practice to have it here.
        return;
      }

      const newListing: Listing = {
          ...newListingData,
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

    
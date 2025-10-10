
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  imageUrl?: string;
  status: ListingStatus;
  claimedBy: string | null;
  createdAt: string; // Store as ISO string for localStorage
  userId: string;
};

const getMockListings = (): Listing[] => {
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
            status: 'awaiting approval',
            claimedBy: 'Community Shelter',
            createdAt: new Date(Date.now() - 3600 * 2000).toISOString(),
            userId: 'admin-user-id',
        }
    ];
    localStorage.setItem('mockListings', JSON.stringify(initialListings));
    return initialListings;
};

const setMockListings = (listings: Listing[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockListings', JSON.stringify(listings));
    }
};


export function useListings(options: { fetchAll?: boolean } = {}) {
  const { fetchAll = false } = options;
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If we aren't fetching all, and there's no user, do nothing.
    if (!fetchAll && !user) {
      setListings([]);
      setIsInitialized(false);
      return;
    }
    
    // Simulate fetching data
    setTimeout(() => {
        const allListings = getMockListings();
        if (fetchAll) {
            setListings(allListings);
        } else if (user) {
            setListings(allListings.filter(l => l.userId === user.uid));
        }
        setIsInitialized(true);
    }, 500);

  }, [user, toast, fetchAll]);

  const addListing = useCallback(
    async (
      newListingData: Omit<
        Listing,
        'id' | 'status' | 'claimedBy' | 'createdAt' | 'userId'
      >
    ) => {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Not Authenticated',
          description: 'You must be logged in to create a listing.',
        });
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
      
      const allListings = getMockListings();
      const updatedListings = [...allListings, newListing];
      setMockListings(updatedListings);
      // Update state for current user's listings page
      if (!fetchAll) {
        setListings(prev => [...prev, newListing]);
      }

      toast({
        title: 'Success!',
        description: 'Your food listing has been created.',
      });
    },
    [user, toast, fetchAll]
  );

  const updateListing = useCallback(
    async (listingId: string, updates: Partial<Omit<Listing, 'id' | 'userId' | 'createdAt'>>) => {
        const allListings = getMockListings();
        const updatedListings = allListings.map(l => l.id === listingId ? {...l, ...updates} : l);
        setMockListings(updatedListings);
        
        if (fetchAll) {
          setListings(updatedListings);
        } else if (user) {
          setListings(updatedListings.filter(l => l.userId === user.uid));
        }
    },
    [fetchAll, user]
  );

  const removeListing = useCallback(
    async (listingId: string) => {
        const allListings = getMockListings();
        const updatedListings = allListings.filter(l => l.id !== listingId);
        setMockListings(updatedListings);

        setListings(prev => prev.filter(l => l.id !== listingId));
        toast({
            title: 'Listing Removed',
            description: 'The listing has been successfully removed.',
        })
    },
    [toast]
  );
  
  const getListingById = useCallback((listingId: string) => {
    const allListings = getMockListings();
    return allListings.find(l => l.id === listingId);
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

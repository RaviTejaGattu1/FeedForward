
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
  createdAt: Date;
  userId: string;
};

// In-memory store for listings
let mockListings: Listing[] = [
    {
        id: 'mock-1',
        foodName: 'Sourdough Bread',
        foodType: 'Baked Goods',
        quantity: 5,
        address: '123 Main St, Anytown',
        status: 'active',
        claimedBy: null,
        createdAt: new Date(Date.now() - 3600 * 1000), // 1 hour ago
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
        createdAt: new Date(Date.now() - 3600 * 2000), // 2 hours ago
        userId: 'admin-user-id',
    }
];

export function useListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setListings([]);
      setIsInitialized(false);
      return;
    }
    
    // Simulate fetching data
    setTimeout(() => {
        setListings(mockListings.filter(l => l.userId === user.uid));
        setIsInitialized(true);
    }, 500);

  }, [user, toast]);

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
          createdAt: new Date(),
      }
      mockListings.push(newListing);
      setListings(prev => [...prev, newListing]);

      toast({
        title: 'Success!',
        description: 'Your food listing has been created.',
      });
    },
    [user, toast]
  );

  const updateListing = useCallback(
    async (listingId: string, updates: Partial<Listing>) => {
      mockListings = mockListings.map(l => l.id === listingId ? {...l, ...updates} : l);
      setListings(prev => prev.map(l => l.id === listingId ? {...l, ...updates} : l));
    },
    []
  );

  const removeListing = useCallback(
    async (listingId: string) => {
        mockListings = mockListings.filter(l => l.id !== listingId);
        setListings(prev => prev.filter(l => l.id !== listingId));
        toast({
            title: 'Listing Removed',
            description: 'The listing has been successfully removed.',
        })
    },
    [toast]
  );

  return {
    listings,
    addListing,
    updateListing,
    removeListing,
    isInitialized,
  };
}

    
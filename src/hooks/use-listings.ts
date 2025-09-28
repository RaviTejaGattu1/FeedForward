
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  createdAt: string;
};

const initialListings: Listing[] = [
  {
    id: '1',
    foodName: 'Sourdough Bread',
    foodType: 'Baked Goods',
    quantity: 10,
    address: '123 Main St, Anytown USA',
    status: 'awaiting approval',
    claimedBy: 'Community Shelter',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    foodName: 'Organic Apples',
    foodType: 'Produce',
    quantity: 50,
    address: '456 Oak Ave, Anytown USA',
    status: 'active',
    claimedBy: null,
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    foodName: 'Canned Beans',
    foodType: 'Pantry',
    quantity: 24,
    address: '789 Pine Ln, Anytown USA',
    status: 'approved',
    claimedBy: 'Jane Doe',
    createdAt: '2023-10-24T09:00:00Z',
  },
  {
    id: '4',
    foodName: 'Fresh Milk',
    foodType: 'Dairy',
    quantity: 12,
    address: '101 Maple Dr, Anytown USA',
    status: 'receiver incoming',
    claimedBy: 'Local Food Bank',
    createdAt: '2023-10-23T18:00:00Z',
  },
];


export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedListings = localStorage.getItem('feedforward-listings');
      if (storedListings) {
        setListings(JSON.parse(storedListings));
      } else {
        // Initialize with default data if nothing is in localStorage
        setListings(initialListings);
      }
    } catch (error) {
      console.error('Failed to read listings from localStorage', error);
      // Fallback to initial data
      setListings(initialListings);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('feedforward-listings', JSON.stringify(listings));
      } catch (error) {
        console.error('Failed to save listings to localStorage', error);
      }
    }
  }, [listings, isInitialized]);

  const addListing = useCallback((newListingData: Omit<Listing, 'id' | 'status' | 'claimedBy' | 'createdAt'>) => {
    const newListing: Listing = {
        ...newListingData,
        id: new Date().toISOString(), // Simple unique ID
        status: 'active',
        claimedBy: null,
        createdAt: new Date().toISOString(),
    };
    setListings(prevListings => [newListing, ...prevListings]);
     toast({
      title: 'Success!',
      description: 'Your food listing has been created.',
    });
  }, [toast]);

  const updateListing = useCallback((listingId: string, updates: Partial<Listing>) => {
    setListings(prevListings => 
        prevListings.map(l => l.id === listingId ? { ...l, ...updates } : l)
    );
  }, []);

  const removeListing = useCallback((listingId: string) => {
    setListings(prevListings => prevListings.filter(l => l.id !== listingId));
  }, []);

  return { listings, setListings, addListing, updateListing, removeListing, isInitialized };
}

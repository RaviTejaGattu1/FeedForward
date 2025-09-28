
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  createdAt: any; // Firestore timestamp
  userId: string;
};

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

    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const listingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Listing[];
        setListings(listingsData);
        setIsInitialized(true);
      },
      (error) => {
        console.error('Error fetching listings:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your listings at this time.',
        });
        setIsInitialized(true);
      }
    );

    return () => unsubscribe();
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

      try {
        await addDoc(collection(db, 'listings'), {
          ...newListingData,
          userId: user.uid,
          status: 'active',
          claimedBy: null,
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Success!',
          description: 'Your food listing has been created.',
        });
      } catch (error) {
        console.error('Error adding listing:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not create your listing at this time.',
        });
      }
    },
    [user, toast]
  );

  const updateListing = useCallback(
    async (listingId: string, updates: Partial<Listing>) => {
      const listingDocRef = doc(db, 'listings', listingId);
      try {
        await updateDoc(listingDocRef, updates);
      } catch (error) {
        console.error('Error updating listing:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not update the listing.',
        });
      }
    },
    [toast]
  );

  const removeListing = useCallback(
    async (listingId: string) => {
      const listingDocRef = doc(db, 'listings', listingId);
      try {
        await deleteDoc(listingDocRef);
        toast({
            title: 'Listing Removed',
            description: 'The listing has been successfully removed.',
        })
      } catch (error) {
        console.error('Error removing listing:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not remove the listing.',
        });
      }
    },
    [toast]
  );

  return {
    listings,
    addListing,
    updateListing,
    removeListing,
    isInitialized,
    // The setListings from useState is intentionally not returned
    // to encourage using the specific action functions above.
  };
}

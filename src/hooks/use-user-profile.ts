
'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  createdAt: any;
  updatedAt?: any;
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // This case might happen briefly if the user was just created.
        // The registration flow should create the doc.
        console.log("No such document!");
      }
      setLoading(false);
    }, (error) => {
        console.error("Failed to fetch user profile:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const updateUserProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'address'>>) => {
      if (!user) return;
      
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { 
            ...updates, 
            updatedAt: serverTimestamp() 
        }, { merge: true });
      } catch (error) {
        console.error("Error updating user profile: ", error);
      }
    },
    [user]
  );

  return { profile, loading, updateUserProfile };
}

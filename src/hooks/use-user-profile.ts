
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, type User } from './use-auth';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date;
};

// In-memory store for user profiles
const mockProfiles: { [uid: string]: UserProfile } = {};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user && !mockProfiles[user.uid]) {
        mockProfiles[user.uid] = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName!,
            createdAt: new Date(),
        };
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    // Simulate fetching profile
    setTimeout(() => {
        const userProfile = mockProfiles[user.uid];
        if (userProfile) {
            setProfile(userProfile);
        }
        setLoading(false);
    }, 300);

  }, [user]);
  
  const updateUserProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'address'>>) => {
      if (!user) return;
      
      setProfile(prev => {
          if (!prev) return null;
          const updatedProfile = {
              ...prev,
              ...updates,
              updatedAt: new Date(),
          };
          mockProfiles[user.uid] = updatedProfile;
          return updatedProfile;
      });
    },
    [user]
  );

  return { profile, loading, updateUserProfile };
}

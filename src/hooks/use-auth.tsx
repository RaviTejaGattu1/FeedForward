
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { createLocalStorageStore } from '@/lib/create-local-storage-store';

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
};

// --- Store Implementation ---
const initialServerUsers: { [email: string]: User } = {
  'admin@feedforward.com': {
    uid: 'admin-user-id',
    email: 'admin@feedforward.com',
    displayName: 'Admin User',
  },
};

// Use the new, reliable store
const userStore = createLocalStorageStore<{ [email: string]: User }>('mockUsers', initialServerUsers);


// --- Auth Context and Provider ---
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<User>;
  signOut: () => Promise<void>;
  register: (name: string, email: string) => Promise<User>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({} as User),
  signOut: async () => {},
  register: async () => ({} as User),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
     if (typeof window === 'undefined') return null;
     return sessionStorage.getItem('mockUserSessionEmail');
  });
  const [loading, setLoading] = useState(true);

  // useSyncExternalStore makes React aware of our external store.
  const allUsers = useSyncExternalStore(userStore.subscribe, userStore.getSnapshot, userStore.getServerSnapshot);

  useEffect(() => {
    setLoading(false);
  }, []);
  
  const user = currentUserEmail ? allUsers[currentUserEmail] || null : null;

  const signIn = useCallback(async (email: string) => {
    setLoading(true);
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = userStore.getSnapshot()[email];
        if (foundUser) {
          sessionStorage.setItem('mockUserSessionEmail', email);
          setCurrentUserEmail(email);
          setLoading(false);
          resolve(foundUser);
        } else {
          setLoading(false);
          reject(new Error('User not found'));
        }
      }, 500);
    });
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        sessionStorage.removeItem('mockUserSessionEmail');
        setCurrentUserEmail(null);
        setLoading(false);
        resolve();
      }, 300);
    });
  }, []);

  const register = useCallback(async (name: string, email: string) => {
    setLoading(true);
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        const currentUsers = userStore.getSnapshot();
        if (currentUsers[email]) {
          setLoading(false);
          return reject(new Error('Email already in use'));
        }
        
        const newUser: User = {
          uid: `user-${Date.now()}`,
          displayName: name,
          email: email,
        };
        
        userStore.setState({ ...currentUsers, [email]: newUser });

        sessionStorage.setItem('mockUserSessionEmail', email);
        setCurrentUserEmail(email);
        setLoading(false);
        resolve(newUser);
      }, 500);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

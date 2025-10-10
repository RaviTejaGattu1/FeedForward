
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This is a mock user type. In a real app, this would be more complex.
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
};

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

const getMockUsers = () => {
  if (typeof window === 'undefined') {
    return {
      'admin@feedforward.com': {
        uid: 'admin-user-id',
        email: 'admin@feedforward.com',
        displayName: 'Admin User',
      },
    };
  }
  const storedUsers = localStorage.getItem('mockUsers');
  return storedUsers
    ? JSON.parse(storedUsers)
    : {
        'admin@feedforward.com': {
          uid: 'admin-user-id',
          email: 'admin@feedforward.com',
          displayName: 'Admin User',
        },
      };
};

const setMockUsers = (users: { [email: string]: User }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(users));
    }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a session in localStorage
    try {
      const storedUser = localStorage.getItem('mockUserSession');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user session from localStorage", e);
      localStorage.removeItem('mockUserSession');
    } finally {
        setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string) => {
    setLoading(true);
    const mockUsers = getMockUsers();
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        if (mockUsers[email]) {
          const loggedInUser = mockUsers[email];
          localStorage.setItem('mockUserSession', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          setLoading(false);
          resolve(loggedInUser);
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
        localStorage.removeItem('mockUserSession');
        setUser(null);
        setLoading(false);
        resolve();
      }, 300);
    });
  }, []);
  
  const register = useCallback(async (name: string, email: string) => {
    setLoading(true);
     return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
          const mockUsers = getMockUsers();
          if (mockUsers[email]) {
            setLoading(false);
            return reject(new Error('Email already in use'));
          }
          const newUser: User = {
              uid: `user-${Date.now()}`,
              displayName: name,
              email: email,
          };
          mockUsers[email] = newUser;
          setMockUsers(mockUsers);
          
          localStorage.setItem('mockUserSession', JSON.stringify(newUser));
          setUser(newUser);
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

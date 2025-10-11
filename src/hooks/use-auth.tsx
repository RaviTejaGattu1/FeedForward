
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

// This is a mock user type.
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
};

// --- Store Implementation ---
// This is the single source of truth for our user data, synchronized with localStorage.

const initialServerUsers: { [email: string]: User } = {
  'admin@feedforward.com': {
    uid: 'admin-user-id',
    email: 'admin@feedforward.com',
    displayName: 'Admin User',
  },
};

const userStore = {
  get: (): { [email: string]: User } => {
    if (typeof window === 'undefined') {
      return initialServerUsers;
    }
    try {
      const item = localStorage.getItem('mockUsers');
      return item ? JSON.parse(item) : initialServerUsers;
    } catch (e) {
      console.error('Failed to parse users from localStorage', e);
      return initialServerUsers;
    }
  },
  set: (value: { [email: string]: User }) => {
    try {
      localStorage.setItem('mockUsers', JSON.stringify(value));
      // Dispatch a custom event to notify other instances of the store in the same tab
      window.dispatchEvent(new Event('local-storage'));
    } catch (e) {
      console.error('Failed to set users in localStorage', e);
    }
  },
  subscribe: (callback: () => void) => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mockUsers') {
        callback();
      }
    };
    // For changes in other tabs
    window.addEventListener('storage', handleStorageChange);
    // For changes in the same tab
    window.addEventListener('local-storage', callback);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', callback);
    };
  },
};


const usersApi = {
  getUsers: () => userStore.get(),
  getUserByEmail: (email: string) => userStore.get()[email] || null,
  addUser: (user: User) => {
    if (!user.email) return;
    const currentUsers = userStore.get();
    const newUsers = { ...currentUsers, [user.email]: user };
    userStore.set(newUsers);
  },
};

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
     return localStorage.getItem('mockUserSessionEmail');
  });
  const [loading, setLoading] = useState(true);

  const allUsers = useSyncExternalStore(userStore.subscribe, userStore.get, () => initialServerUsers);

  useEffect(() => {
    setLoading(false);
  }, []);
  
  const user = currentUserEmail ? allUsers[currentUserEmail] || null : null;

  const signIn = useCallback(async (email: string) => {
    setLoading(true);
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = usersApi.getUserByEmail(email);
        if (foundUser) {
          localStorage.setItem('mockUserSessionEmail', email);
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
        localStorage.removeItem('mockUserSessionEmail');
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
        if (usersApi.getUserByEmail(email)) {
          setLoading(false);
          return reject(new Error('Email already in use'));
        }
        
        const newUser: User = {
          uid: `user-${Date.now()}`,
          displayName: name,
          email: email,
        };
        
        usersApi.addUser(newUser);

        localStorage.setItem('mockUserSessionEmail', email);
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


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

const initialServerUsers: { [email: string]: User } = {
  'admin@feedforward.com': {
    uid: 'admin-user-id',
    email: 'admin@feedforward.com',
    displayName: 'Admin User',
  },
};

let memoryState: { [email: string]: User } | null = null;
const listeners: Set<() => void> = new Set();

const userStore = {
  get: (): { [email: string]: User } => {
    if (typeof window === 'undefined') {
      // On the server, always return the initial hardcoded list.
      return initialServerUsers;
    }

    // On the client, read from localStorage on the first call.
    if (memoryState === null) {
      try {
        const item = localStorage.getItem('mockUsers');
        memoryState = item ? JSON.parse(item) : initialServerUsers;
      } catch (e) {
        console.error('Failed to parse users from localStorage', e);
        memoryState = initialServerUsers;
      }
    }
    return memoryState;
  },
  set: (value: { [email: string]: User }) => {
    memoryState = value;
    try {
      localStorage.setItem('mockUsers', JSON.stringify(value));
    } catch (e) {
      console.error('Failed to set users in localStorage', e);
    }
    // Notify all listeners that the data has changed.
    listeners.forEach((l) => l());
  },
  subscribe: (callback: () => void): (() => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};

// Listen for changes in other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === 'mockUsers') {
      try {
        const newValue = event.newValue;
        // Update the in-memory state and notify listeners.
        memoryState = newValue ? JSON.parse(newValue) : initialServerUsers;
        listeners.forEach((l) => l());
      } catch(e) {
        console.error('Failed to parse users from storage event', e);
        memoryState = initialServerUsers;
        listeners.forEach((l) => l());
      }
    }
  });
}


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
        const foundUser = userStore.get()[email];
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
        const currentUsers = userStore.get();
        if (currentUsers[email]) {
          setLoading(false);
          return reject(new Error('Email already in use'));
        }
        
        const newUser: User = {
          uid: `user-${Date.now()}`,
          displayName: name,
          email: email,
        };
        
        const newUsers = { ...currentUsers, [email]: newUser };
        userStore.set(newUsers);

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

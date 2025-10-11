
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

let usersStore: { [email: string]: User } = { ...initialServerUsers };
const listeners = new Set<() => void>();

function getUsersFromLocalStorage() {
  if (typeof window === 'undefined') {
    return { ...initialServerUsers };
  }
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
  }
  // If nothing in localStorage, initialize it.
  localStorage.setItem('mockUsers', JSON.stringify(initialServerUsers));
  return { ...initialServerUsers };
}

// Initialize the store from localStorage
usersStore = getUsersFromLocalStorage();

const setUsersStore = (newUsers: { [email: string]: User }) => {
  usersStore = newUsers;
  if (typeof window !== 'undefined') {
    // This write will trigger the 'storage' event in other tabs.
    localStorage.setItem('mockUsers', JSON.stringify(usersStore));
  }
  // Notify all subscribed components in the current tab that the data has changed.
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'mockUsers' && event.newValue) {
      try {
        const newUsers = JSON.parse(event.newValue);
        if (JSON.stringify(usersStore) !== JSON.stringify(newUsers)) {
           usersStore = newUsers;
           // When storage changes in another tab, notify listeners in this tab.
           listeners.forEach(listener => listener());
        }
      } catch (e) {
        console.error('Failed to parse users from storage event', e);
      }
    }
  });
}

// Store API
const usersApi = {
  getUsers: () => usersStore,
  getUserByEmail: (email: string) => usersStore[email] || null,
  addUser: (user: User) => {
    if (!user.email) return;
    const newUsers = { ...usersStore, [user.email]: user };
    setUsersStore(newUsers);
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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // useSyncExternalStore makes React aware of our external user store.
  const allUsers = useSyncExternalStore(subscribe, usersApi.getUsers, () => initialServerUsers);

  useEffect(() => {
    // Check for a session in localStorage on initial client-side load
    try {
      const sessionEmail = localStorage.getItem('mockUserSessionEmail');
      if (sessionEmail) {
        setCurrentUserEmail(sessionEmail);
      }
    } catch (e) {
      console.error('Failed to initialize user session from localStorage', e);
    } finally {
      setLoading(false);
    }
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
        
        // This is the critical fix: update the shared user store.
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

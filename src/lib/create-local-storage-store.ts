
'use client';

// A robust, reusable store for synchronizing state with localStorage across tabs.
export function createLocalStorageStore<T>(key: string, initialValue: T) {
  let memoryState: T | null = null;
  const listeners = new Set<() => void>();

  const getSnapshot = (): T => {
    if (memoryState !== null) {
      return memoryState;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (item) {
        memoryState = JSON.parse(item);
        return memoryState as T;
      }
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage`, e);
    }
    
    memoryState = initialValue;
    return memoryState;
  };

  const setState = (value: T) => {
    memoryState = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to set ${key} in localStorage`, e);
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const getServerSnapshot = () => initialValue;
  
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          if (JSON.stringify(newState) !== JSON.stringify(memoryState)) {
             memoryState = newState;
             listeners.forEach((l) => l());
          }
        } catch (e) {
          console.error(`Failed to handle storage event for ${key}`, e);
        }
      }
    });
  }

  return {
    getSnapshot,
    setState,
    subscribe,
    getServerSnapshot,
  };
}

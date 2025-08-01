// LocalStorage utility functions for Pinia store persistence

export const storage = {
  // Save data to localStorage
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get data from localStorage
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove data from localStorage
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Clear all data from localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Pinia plugin for automatic localStorage persistence
export const piniaLocalStorage = (context: any) => {
  const { store } = context;

  // Subscribe to store changes and save to localStorage
  store.$subscribe((_mutation: any, state: any) => {
    const storeName = store.$id;
    storage.set(storeName, state);
  });

  // Restore state from localStorage on store initialization
  const savedState = storage.get(store.$id, null);
  if (savedState) {
    store.$patch(savedState);
  }
};

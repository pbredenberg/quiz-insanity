import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '../types';

export const useUserProfileStore = defineStore('userProfile', () => {
  // State
  const profile = ref<UserProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isLoggedIn = computed(() => profile.value !== null);
  const userName = computed(() => profile.value?.name || 'Guest');
  const userEmail = computed(() => profile.value?.email || '');
  const userDescription = computed(() => profile.value?.description || '');
  const userInterests = computed(() => profile.value?.interests || []);
  const userPreferences = computed(
    () => profile.value?.preferences || { theme: 'dark', notifications: true }
  );

  // Actions
  const createProfile = (name: string, email: string, description?: string, interests?: string[]) => {
    isLoading.value = true;
    error.value = null;

    try {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        name,
        email,
        description,
        interests,
        preferences: {
          theme: 'dark',
          notifications: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profile.value = newProfile;
    } catch (err) {
      error.value = 'Failed to create profile';
      console.error('Error creating profile:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile.value) return;

    try {
      profile.value = {
        ...profile.value,
        ...updates,
        updatedAt: new Date(),
      };
    } catch (err) {
      error.value = 'Failed to update profile';
      console.error('Error updating profile:', err);
    }
  };

  const updatePreferences = (
    preferences: Partial<UserProfile['preferences']>
  ) => {
    if (!profile.value) return;

    try {
      profile.value.preferences = {
        ...profile.value.preferences,
        ...preferences,
      };
      profile.value.updatedAt = new Date();
    } catch (err) {
      error.value = 'Failed to update preferences';
      console.error('Error updating preferences:', err);
    }
  };

  const clearProfile = () => {
    profile.value = null;
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    profile,
    isLoading,
    error,

    // Getters
    isLoggedIn,
    userName,
    userEmail,
    userDescription,
    userInterests,
    userPreferences,

    // Actions
    createProfile,
    updateProfile,
    updatePreferences,
    clearProfile,
    clearError,
  };
});

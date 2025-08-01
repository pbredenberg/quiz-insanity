<template>
  <div class="max-w-md mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-white mb-6">User Profile</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Gravatar Image -->
        <div class="mb-4 flex justify-center">
          <img
            v-if="form.email"
            :src="gravatarUrl"
            :alt="form.name || 'User'"
            class="w-24 h-24 rounded-full border-2 border-gray-600"
          />
          <div v-else class="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
            <span class="text-3xl">?</span>
          </div>
        </div>
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Name
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        
        <!-- Description Field (250 char limit) -->
        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Description (250 characters max)
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            maxlength="250"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about yourself"
          ></textarea>
          <div class="text-xs text-gray-400 mt-1 text-right">
            {{ form.description.length }} / 250
          </div>
        </div>
        
        <!-- Interests Tags Field -->
        <div>
          <label
            for="interests"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Interests
          </label>
          <div class="flex">
            <input
              id="interests"
              v-model="interestInput"
              type="text"
              @keydown.enter.prevent="addInterestFromInput"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type and press Enter to add interests"
            />
          </div>
          
          <!-- Display interests as tags -->
          <div class="flex flex-wrap gap-2 mt-2" v-if="interestsArray.length > 0">
            <div 
              v-for="(interest, index) in interestsArray" 
              :key="index"
              class="bg-blue-700 text-white text-sm px-2 py-1 rounded-md flex items-center"
            >
              {{ interest }}
              <button 
                @click="removeInterest(index)" 
                class="ml-2 text-white hover:text-red-300"
                type="button"
              >
                &times;
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Theme
          </label>
          <select
            v-model="form.theme"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div class="flex items-center">
          <input
            id="notifications"
            v-model="form.notifications"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
          />
          <label for="notifications" class="ml-2 block text-sm text-gray-300">
            Enable notifications
          </label>
        </div>

        <div v-if="userProfileStore.error" class="text-red-400 text-sm">
          {{ userProfileStore.error }}
        </div>

        <button
          type="submit"
          :disabled="userProfileStore.isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          <span v-if="userProfileStore.isLoading">Saving...</span>
          <span v-else>{{
            isEditing ? 'Update Profile' : 'Create Profile'
          }}</span>
        </button>
      </form>

      <div
        v-if="userProfileStore.profile"
        class="mt-6 pt-6 border-t border-gray-700"
      >
        <h3 class="text-lg font-medium text-white mb-2">Current Profile</h3>
        <div class="bg-gray-700 rounded-md p-4">
          <p class="text-gray-300">
            <span class="font-medium">Name:</span>
            {{ userProfileStore.userName }}
          </p>
          <p class="text-gray-300">
            <span class="font-medium">Email:</span>
            {{ userProfileStore.userEmail }}
          </p>

          <!-- Display description if available -->
          <div v-if="userProfileStore.userDescription" class="mt-2">
            <p class="text-gray-300">
              <span class="font-medium">About:</span>
              {{ userProfileStore.userDescription }}
            </p>
          </div>
          
          <!-- Display interests if available -->
          <div v-if="userProfileStore.userInterests.length > 0" class="mt-2">
            <p class="text-gray-300 mb-1">
              <span class="font-medium">Interests:</span>
            </p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(interest, index) in userProfileStore.userInterests" 
                :key="index"
                class="bg-blue-700 text-white text-sm px-2 py-1 rounded-md"
              >
                {{ interest }}
              </span>
            </div>
          </div>
          
          <!-- Display Gravatar in profile section -->
          <div class="mt-4 flex justify-center">
            <img
              :src="getGravatarUrl(userProfileStore.userEmail, 96)"
              :alt="userProfileStore.userName"
              class="w-24 h-24 rounded-full border-2 border-gray-600"
            />
          </div>
          <p class="text-gray-300">
            <span class="font-medium">Theme:</span>
            {{ userProfileStore.userPreferences.theme }}
          </p>
          <p class="text-gray-300">
            <span class="font-medium">Notifications:</span>
            {{
              userProfileStore.userPreferences.notifications
                ? 'Enabled'
                : 'Disabled'
            }}
          </p>
        </div>
        <button
          @click="userProfileStore.clearProfile"
          class="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Clear Profile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserProfileStore } from '../stores/userProfile';
import { getGravatarUrl } from '../utils/gravatar';

const userProfileStore = useUserProfileStore();

const form = ref({
  name: '',
  email: '',
  description: '',
  theme: 'dark' as 'dark' | 'light',
  notifications: true,
});

// For interests tag input
const interestInput = ref('');
const interestsArray = ref<string[]>([]);

const isEditing = computed(() => userProfileStore.isLoggedIn);

// Compute Gravatar URL from email
const gravatarUrl = computed(() => getGravatarUrl(form.value.email, 96));

onMounted(() => {
  if (userProfileStore.profile) {
    form.value.name = userProfileStore.profile.name;
    form.value.email = userProfileStore.profile.email;
    form.value.description = userProfileStore.profile.description || '';
    form.value.theme = userProfileStore.profile.preferences.theme;
    form.value.notifications =
      userProfileStore.profile.preferences.notifications;
    
    // Initialize interests array from profile
    if (userProfileStore.profile.interests) {
      interestsArray.value = [...userProfileStore.profile.interests];
    }
  }
});

// Method to add an interest from the input
const addInterestFromInput = () => {
  const interest = interestInput.value.trim();
  if (interest && !interestsArray.value.includes(interest)) {
    interestsArray.value.push(interest);
    interestInput.value = '';
  }
};

// Method to remove an interest
const removeInterest = (index: number) => {
  interestsArray.value.splice(index, 1);
};

const handleSubmit = () => {
  if (isEditing.value) {
    userProfileStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
      description: form.value.description,
      interests: interestsArray.value,
    });
    userProfileStore.updatePreferences({
      theme: form.value.theme,
      notifications: form.value.notifications,
    });
  } else {
    userProfileStore.createProfile(
      form.value.name, 
      form.value.email, 
      form.value.description,
      interestsArray.value
    );
    userProfileStore.updatePreferences({
      theme: form.value.theme,
      notifications: form.value.notifications,
    });
  }
};
</script>

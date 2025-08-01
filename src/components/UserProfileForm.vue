<template>
  <div class="max-w-md mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-white mb-6">User Profile</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
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

const userProfileStore = useUserProfileStore();

const form = ref({
  name: '',
  email: '',
  theme: 'dark' as 'dark' | 'light',
  notifications: true,
});

const isEditing = computed(() => userProfileStore.isLoggedIn);

onMounted(() => {
  if (userProfileStore.profile) {
    form.value.name = userProfileStore.profile.name;
    form.value.email = userProfileStore.profile.email;
    form.value.theme = userProfileStore.profile.preferences.theme;
    form.value.notifications =
      userProfileStore.profile.preferences.notifications;
  }
});

const handleSubmit = () => {
  if (isEditing.value) {
    userProfileStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
    });
    userProfileStore.updatePreferences({
      theme: form.value.theme,
      notifications: form.value.notifications,
    });
  } else {
    userProfileStore.createProfile(form.value.name, form.value.email);
    userProfileStore.updatePreferences({
      theme: form.value.theme,
      notifications: form.value.notifications,
    });
  }
};
</script>

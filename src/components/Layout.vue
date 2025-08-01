<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-white">Quiz Insanity</h1>
          </div>
          <nav class="flex space-x-4 items-center">
            <router-link
              to="/"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-white bg-gray-700"
            >
              Home
            </router-link>

            <router-link
              to="/create"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-white bg-gray-700"
            >
              Create Quiz
            </router-link>
            <router-link
              to="/quizzes"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-white bg-gray-700"
            >
              My Quizzes
            </router-link>
            <router-link
              to="/profile"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              active-class="text-white bg-gray-700"
            >
              <!-- Show avatar if logged in -->
              <template v-if="isLoggedIn && userEmail">
                <img
                  :src="avatarUrl"
                  :alt="userProfileStore.userName"
                  class="w-8 h-8 rounded-full avatar-img"
                />
              </template>
              <!-- Otherwise show text -->
              <template v-else>
                Profile
              </template>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 border-t border-gray-700 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-gray-400 text-sm">
          Quiz Insanity - Generate quizzes from any website
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Layout component with dark theme and navigation
import { useUserProfileStore } from '../stores/userProfile';
import { getGravatarUrl } from '../utils/gravatar';
import { computed } from 'vue';

// Create references to the user profile store
const userProfileStore = useUserProfileStore();

// Computed properties for user data
const userEmail = computed(() => userProfileStore.userEmail);
const avatarUrl = computed(() => getGravatarUrl(userEmail.value, 32));
const isLoggedIn = computed(() => userProfileStore.isLoggedIn);
</script>

<style scoped>
.avatar-img {
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.2s ease;
}

.router-link-active .avatar-img,
.router-link:hover .avatar-img {
  border-color: rgba(255, 255, 255, 0.6);
}
</style>

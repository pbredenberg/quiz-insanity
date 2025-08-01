<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-white">Quiz Insanity</h1>
          </div>
          <nav class="flex space-x-4">
            <router-link
              to="/"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-white bg-gray-700"
            >
              Home
            </router-link>
            <router-link
              to="/profile"
              class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-white bg-gray-700"
            >
              Profile
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
</script>

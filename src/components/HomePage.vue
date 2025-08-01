<template>
  <div class="max-w-4xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-white mb-4">
        Welcome to Quiz Insanity
      </h1>
      <p class="text-xl text-gray-300 mb-8">
        Generate intelligent quizzes from any website using AI
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/create"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
        >
          Create New Quiz
        </router-link>
        <router-link
          to="/quizzes"
          class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
        >
          Take a Quiz
        </router-link>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-gray-800 rounded-lg p-6 text-center">
        <div class="text-3xl font-bold text-blue-400 mb-2">
          {{ quizzesStore.quizzesCount }}
        </div>
        <div class="text-gray-300">Quizzes Created</div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 text-center">
        <div class="text-3xl font-bold text-green-400 mb-2">
          {{ userProfileStore.isLoggedIn ? 'Active' : 'Guest' }}
        </div>
        <div class="text-gray-300">User Status</div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 text-center">
        <div class="text-3xl font-bold text-purple-400 mb-2">AI-Powered</div>
        <div class="text-gray-300">Quiz Generation</div>
      </div>
    </div>

    <!-- Recent Quizzes -->
    <div v-if="quizzesStore.quizzes.length > 0" class="mb-12">
      <h2 class="text-2xl font-bold text-white mb-6">Recent Quizzes</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="quiz in recentQuizzes"
          :key="quiz.id"
          class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors relative group"
        >
          <!-- Delete Button -->
          <button
            @click.stop="showDeleteConfirmation(quiz)"
            class="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Delete quiz"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
          </button>

          <!-- Quiz Card Content -->
          <div
            class="cursor-pointer"
            @click="startQuiz(quiz.id)"
          >
            <h3 class="text-lg font-semibold text-white mb-2">
              {{ quiz.title }}
            </h3>
            <p class="text-gray-300 text-sm mb-3">{{ quiz.description }}</p>
            <div class="flex justify-between items-center text-xs text-gray-400">
              <span>{{ quiz.questions.length }} questions</span>
              <span>{{ formatDate(quiz.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cancelDelete"
    >
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-white mb-4">Delete Quiz</h3>
        <p class="text-gray-300 mb-6">
          Are you sure you want to delete "{{ quizToDelete?.title }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-blue-600 rounded-lg p-2 mr-4">
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white">
            AI-Powered Generation
          </h3>
        </div>
        <p class="text-gray-300">
          Our AI analyzes website content and generates intelligent quiz
          questions automatically.
        </p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-green-600 rounded-lg p-2 mr-4">
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white">Instant Results</h3>
        </div>
        <p class="text-gray-300">
          Get immediate feedback and detailed explanations for each question.
        </p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-purple-600 rounded-lg p-2 mr-4">
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white">Secure & Private</h3>
        </div>
        <p class="text-gray-300">
          Your data is stored locally and never shared with third parties.
        </p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="bg-yellow-600 rounded-lg p-2 mr-4">
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white">Any Website</h3>
        </div>
        <p class="text-gray-300">
          Generate quizzes from any website URL - articles, documentation,
          blogs, and more.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuizzesStore } from '../stores/quizzes';
import { useUserProfileStore } from '../stores/userProfile';

const quizzesStore = useQuizzesStore();
const userProfileStore = useUserProfileStore();

const recentQuizzes = computed(() => {
  return quizzesStore.quizzes
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
});

const startQuiz = (quizId: string) => {
  quizzesStore.startQuizAttempt(quizId);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

// Delete functionality
const showDeleteDialog = ref(false);
const quizToDelete = ref(null);

const showDeleteConfirmation = (quiz: any) => {
  quizToDelete.value = quiz;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
  quizToDelete.value = null;
};

const confirmDelete = () => {
  quizzesStore.removeQuiz(quizToDelete.value.id);
  showDeleteDialog.value = false;
  quizToDelete.value = null;
};
</script>

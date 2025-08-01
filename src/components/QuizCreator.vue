<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-white mb-6">Create New Quiz</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="url" class="block text-sm font-medium text-gray-300 mb-2">
            Website URL
          </label>
          <input
            id="url"
            v-model="form.url"
            type="url"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
          <p class="text-sm text-gray-400 mt-1">
            Enter the URL of the website you want to generate a quiz from
          </p>
        </div>

        <div>
          <label
            for="title"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Quiz Title
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-300 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the quiz"
          ></textarea>
        </div>

        <div
          v-if="quizzesStore.error"
          class="text-red-400 text-sm bg-red-900/20 p-3 rounded-md"
        >
          {{ quizzesStore.error }}
        </div>

        <button
          type="submit"
          :disabled="quizzesStore.isLoading || !form.url || !form.title"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <svg
            v-if="quizzesStore.isLoading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-if="quizzesStore.isLoading">{{
            currentStep === 'parsing'
              ? 'Fetching Website...'
              : 'Generating Quiz...'
          }}</span>
          <span v-else>Generate Quiz</span>
        </button>
      </form>

      <!-- Generation Status -->
      <div
        v-if="quizzesStore.isLoading"
        class="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-md"
      >
        <div class="flex items-center">
          <svg
            class="animate-spin h-5 w-5 text-blue-400 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div>
            <h3 class="text-blue-400 font-medium">
              {{
                currentStep === 'parsing'
                  ? 'Fetching Website'
                  : 'Generating Quiz'
              }}
            </h3>
            <p class="text-blue-300 text-sm">
              {{
                currentStep === 'parsing'
                  ? 'Downloading and analyzing website content...'
                  : 'Creating questions with AI...'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div
        v-if="showSuccess"
        class="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-md"
      >
        <div class="flex items-center">
          <svg
            class="h-5 w-5 text-green-400 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div>
            <h3 class="text-green-400 font-medium">
              Quiz Created Successfully!
            </h3>
            <p class="text-green-300 text-sm">
              Your quiz has been generated and saved. Redirecting to quiz...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizzesStore } from '../stores/quizzes';
import { ApiService } from '../services/api';
import type { Quiz } from '../types';

const router = useRouter();
const quizzesStore = useQuizzesStore();

const form = ref({
  url: '',
  title: '',
  description: '',
});

const showSuccess = ref(false);
const currentStep = ref<'parsing' | 'generating'>('parsing');

const handleSubmit = async () => {
  if (!form.value.url || !form.value.title) return;

  try {
    quizzesStore.setLoading(true);
    currentStep.value = 'parsing';
    quizzesStore.clearError();

    // Step 1: Parse the website
    const parseResult = await ApiService.parseWebsite(form.value.url);

    if (!parseResult.success) {
      quizzesStore.error = parseResult.error || 'Failed to parse website';
      return;
    }

    // Step 2: Generate quiz from the content
    currentStep.value = 'generating';

    const generateResult = await ApiService.generateQuiz(
      parseResult.content!,
      parseResult.title!,
      form.value.title,
      form.value.description
    );

    if (!generateResult.success) {
      quizzesStore.error = generateResult.error || 'Failed to generate quiz';
      return;
    }

    // Add the quiz to the store
    const quiz: Quiz = {
      ...generateResult.quiz,
      sourceUrl: form.value.url,
    };

    quizzesStore.addQuiz(quiz);
    showSuccess.value = true;

    // Reset form
    form.value = {
      url: '',
      title: '',
      description: '',
    };

    // Redirect to quiz page after 2 seconds
    setTimeout(() => {
      showSuccess.value = false;
      // Start the quiz and navigate to the quiz page
      quizzesStore.startQuizAttempt(quiz.id);
      router.push('/quizzes');
    }, 2000);
  } catch (error) {
    console.error('Error creating quiz:', error);
    quizzesStore.error = 'An unexpected error occurred. Please try again.';
  } finally {
    quizzesStore.setLoading(false);
  }
};
</script>

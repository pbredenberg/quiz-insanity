<template>
  <div class="max-w-4xl mx-auto relative">  
    <!-- Global Notification -->
    <div 
      v-if="exportSuccess || exportError" 
      class="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300"
      :class="{
        'bg-green-600 text-white': exportSuccess,
        'bg-red-600 text-white': exportError
      }"
    >
      <div class="flex items-center">
        <span v-if="exportSuccess" class="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </span>
        <span v-if="exportError" class="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </span>
        <span>{{ exportSuccess ? 'Quiz exported successfully!' : exportError }}</span>
        <button 
          @click="clearExportNotification" 
          class="ml-4 text-white hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    <!-- Quiz Selection -->
    <div
      v-if="!quizzesStore.currentQuiz"
      class="bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <h2 class="text-2xl font-bold text-white mb-6">Take a Quiz</h2>

      <div v-if="quizzesStore.quizzes.length === 0" class="text-center py-8">
        <p class="text-gray-400 mb-4">No quizzes available yet.</p>
        <router-link
          to="/create"
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Create Your First Quiz
        </router-link>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="quiz in quizzesStore.quizzes"
          :key="quiz.id"
          class="bg-gray-700 rounded-lg p-4 relative group"
        >
          <div 
            class="hover:bg-gray-600 transition-colors cursor-pointer p-4 -m-4"
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
          
          <!-- Export button for each quiz -->
          <div 
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop="exportQuiz(quiz)"
          >
            <button 
              class="bg-green-600 hover:bg-green-700 text-white p-1 rounded-full transition-colors duration-200"
              title="Export Quiz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Interface -->
    <div v-else class="space-y-6">
      <!-- Quiz Header -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-white">
            {{ quizzesStore.currentQuiz.title }}
          </h2>
          <div class="flex items-center space-x-2">
            <!-- Export Button -->
            <button
              @click="exportCurrentQuiz"
              :disabled="exportLoading"
              class="text-gray-400 hover:text-green-500 transition-colors"
              title="Export Quiz"
            >
              <span v-if="exportLoading">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            <!-- Close Button -->
            <button
              @click="quizzesStore.clearCurrentQuiz"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm text-gray-300">
          <span
            >Question {{ currentQuestionIndex + 1 }} of
            {{ quizzesStore.currentQuizQuestions.length }}</span
          >
          <span>Score: {{ quizzesStore.currentQuizScore }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${quizzesStore.currentQuizProgress}%` }"
          ></div>
        </div>
      </div>

      <!-- Question Display -->
      <div
        v-if="currentQuestion && !quizCompleted"
        class="bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <h3 class="text-xl font-semibold text-white mb-6">
          {{ currentQuestion.question }}
        </h3>

        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="selectAnswer(index)"
            :class="[
              'w-full text-left p-4 rounded-lg border transition-all duration-200',
              selectedAnswer === index
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600',
            ]"
          >
            {{ option }}
          </button>
        </div>

        <div class="flex justify-between mt-6">
          <button
            v-if="currentQuestionIndex > 0"
            @click="previousQuestion"
            class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Previous
          </button>
          <button
            v-if="selectedAnswer !== null"
            @click="nextQuestion"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {{ isLastQuestion ? 'Finish Quiz' : 'Next' }}
          </button>
        </div>
      </div>

      <!-- Quiz Results -->
      <div v-if="quizCompleted" class="bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-white mb-4">Quiz Completed!</h3>

          <div class="bg-gray-700 rounded-lg p-6 mb-6">
            <div class="text-4xl font-bold text-blue-400 mb-2">
              {{ quizzesStore.currentQuizScore }}/{{
                quizzesStore.currentQuizQuestions.length
              }}
            </div>
            <div class="text-gray-300">{{ getScorePercentage() }}% Correct</div>
          </div>

          <div class="space-y-4">
            <button
              @click="restartQuiz"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Take Quiz Again
            </button>
            <button
              @click="exportCurrentQuiz"
              :disabled="exportLoading"
              class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
            >
              <span v-if="exportLoading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Export Quiz
            </button>
            <button
              @click="quizzesStore.clearCurrentQuiz"
              class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Quizzes
            </button>
            
            <!-- Export Feedback Messages -->
            <div v-if="exportSuccess" class="mt-2 text-green-400 text-sm">
              Quiz exported successfully!
            </div>
            <div v-if="exportError" class="mt-2 text-red-400 text-sm">
              {{ exportError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuizzesStore } from '../stores/quizzes';
import { ApiService } from '../services/api';

// For export feedback
const exportLoading = ref(false);
const exportError = ref('');
const exportSuccess = ref(false);

const quizzesStore = useQuizzesStore();

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const quizCompleted = ref(false);

const currentQuestion = computed(() => {
  if (!quizzesStore.currentQuiz) return null;
  return quizzesStore.currentQuizQuestions[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
  if (!quizzesStore.currentQuiz) return false;
  return (
    currentQuestionIndex.value === quizzesStore.currentQuizQuestions.length - 1
  );
});

const startQuiz = (quizId: string) => {
  quizzesStore.startQuizAttempt(quizId);
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
};

const selectAnswer = (answerIndex: number) => {
  selectedAnswer.value = answerIndex;
  quizzesStore.submitAnswer(currentQuestionIndex.value, answerIndex);
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    quizCompleted.value = true;
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value =
      quizzesStore.currentAttempt?.answers[currentQuestionIndex.value] ?? null;
  }
};

const restartQuiz = () => {
  if (quizzesStore.currentQuiz) {
    startQuiz(quizzesStore.currentQuiz.id);
  }
};

const getScorePercentage = () => {
  if (!quizzesStore.currentQuiz) return 0;
  return Math.round(
    (quizzesStore.currentQuizScore / quizzesStore.currentQuizQuestions.length) *
      100
  );
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

/**
 * Export a quiz as a JSON file
 * @param quiz The quiz to export
 */
const exportQuiz = async (quiz: any) => {
  try {
    exportLoading.value = true;
    exportError.value = '';
    exportSuccess.value = false;
    
    // Generate a filename based on the quiz title
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${quiz.title.replace(/\s+/g, '-')}-${timestamp}.json`;
    
    // Call the API service to export the quiz
    const blob = await ApiService.exportQuiz(quiz, 'json', filename);
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    exportSuccess.value = true;
    setTimeout(() => {
      exportSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error exporting quiz:', error);
    exportError.value = error instanceof Error ? error.message : 'Failed to export quiz';
    setTimeout(() => {
      exportError.value = '';
    }, 5000);
  } finally {
    exportLoading.value = false;
  }
};

/**
 * Export the current quiz as a JSON file
 */
const exportCurrentQuiz = async () => {
  if (!quizzesStore.currentQuiz) return;
  await exportQuiz(quizzesStore.currentQuiz);
};

/**
 * Clear export notification
 */
const clearExportNotification = () => {
  exportSuccess.value = false;
  exportError.value = '';
};

onMounted(() => {
  // Reset state when component mounts
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
});
</script>

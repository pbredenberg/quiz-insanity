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
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 mr-2"
        >
          Create Your First Quiz
        </router-link>
        <router-link
          to="/quiz/create"
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Add New Quiz Manually
        </router-link>
      </div>

      <div class="mb-4 flex justify-between items-center">
        <h3 class="text-lg font-medium text-white">Available Quizzes</h3>
        <router-link
          to="/quiz/create"
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Add New Quiz Manually
        </router-link>
      </div>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Export All Button -->
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <button
            @click="exportAllQuizzes"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Export All Quizzes
          </button>
        </div>
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
            <div class="flex justify-between items-center text-xs text-gray-400 mb-2">
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
          <div class="flex justify-between items-center mt-2">
            <div v-if="userProfileStore.isLoggedIn" class="text-xs bg-gray-800 rounded p-2 text-blue-400">
              <span class="font-medium">Best Score:</span> {{ getBestScoreForQuiz(quiz.id) }}
            </div>
            <button
              @click.stop="editQuiz(quiz.id, $event)"
              class="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded p-2 transition-colors"
            >
              Edit
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
        <!-- Hidden canvas for image generation - similar to an offscreen UIView in iOS -->
        <canvas
          ref="scoreCanvas"
          width="600"
          height="600"
          class="hidden"
        ></canvas>
        <div class="text-center">
          <h3 class="text-2xl font-bold text-white mb-4">Quiz Completed!</h3>

          <div class="bg-gray-700 rounded-lg p-6 mb-6">
            <div class="text-4xl font-bold text-blue-400 mb-2">
              {{ quizzesStore.currentQuizScore }}/{{ quizzesStore.currentQuizQuestions.length }}
            </div>
            <div class="text-gray-300">{{ getScorePercentage() }}% Correct</div>

            <!-- Best Score Comparison -->
            <div v-if="userProfileStore.isLoggedIn && getCurrentBestScore()" class="mt-4 pt-4 border-t border-gray-600">
              <div class="text-sm text-gray-300">
                <span class="font-medium">Your Best Score:</span>
                {{ getCurrentBestScore()?.score }}/{{ getCurrentBestScore()?.totalQuestions }}
                ({{ Math.round(getCurrentBestScore()?.percentage || 0) }}%)
              </div>
              <div v-if="quizzesStore.currentQuizScore > (getCurrentBestScore()?.score || 0)"
                   class="text-sm text-green-400 mt-1">
                <span class="font-medium">New Personal Best!</span> 🎉
              </div>
            </div>
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

            <!-- Twitter Share Button -->
            <a
              :href="twitterShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center bg-[#1DA1F2] hover:bg-[#1a96d4] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                />
              </svg>
              Share on Twitter
            </a>

            <!-- Download Score Image Button -->
            <button
              @click="generateAndDownloadImage"
              class="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <svg
                class="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Score Image
            </button>
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
const exportSuccess = ref('');
import { useQuizScoresStore } from '../stores/quizScores';
import { useUserProfileStore } from '../stores/userProfile';

const quizzesStore = useQuizzesStore();
const quizScoresStore = useQuizScoresStore();
const userProfileStore = useUserProfileStore();

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const quizCompleted = ref(false);
const scoreCanvas = ref<HTMLCanvasElement | null>(null);

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

const getBestScoreForQuiz = (quizId: string) => {
  const bestScore = quizScoresStore.getBestScoreForQuiz(quizId);
  return bestScore ? `${bestScore.score}/${bestScore.totalQuestions} (${Math.round(bestScore.percentage)}%)` : 'No attempts';
};

const twitterShareUrl = computed(() => {
  if (!quizzesStore.currentQuiz) return '#';

  const score = quizzesStore.currentQuizScore;
  const total = quizzesStore.currentQuizQuestions.length;
  const percentage = getScorePercentage();
  const quizTitle = quizzesStore.currentQuiz.title;

  const message = `I scored ${score}/${total} (${percentage}%) on "${quizTitle}" in Quiz Insanity! Can you beat my score?`;

  const encodedMessage = encodeURIComponent(message);
  const appUrl = encodeURIComponent(window.location.origin);

  return `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${appUrl}`;
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
    // Save score when quiz is completed
    if (quizzesStore.currentQuiz && quizzesStore.currentAttempt) {
      quizScoresStore.addScore(
        quizzesStore.currentQuiz.id,
        quizzesStore.currentQuiz.title,
        quizzesStore.currentQuizScore,
        quizzesStore.currentQuizQuestions.length
      );
    }
  } else {
    currentQuestionIndex.value++;
    selectedAnswer.value =
      quizzesStore.currentAttempt?.answers[currentQuestionIndex.value] ?? null;
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

const editQuiz = (quizId: string, event?: Event) => {
  // Prevent the parent div click event from firing
  event?.stopPropagation();
  // Navigate to the edit page with the quiz ID
  window.location.href = `/quiz/edit/${quizId}`;
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
    exportSuccess.value = '';

    // Generate a filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `quiz-${quiz.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.json`;

    // Export using API service
    await ApiService.exportQuiz(quiz, 'json', filename);

    exportSuccess.value = 'Quiz exported successfully';
    setTimeout(() => {
      exportSuccess.value = '';
    }, 3000);
  } catch (err) {
    console.error('Error exporting quiz:', err);
    exportError.value = err instanceof Error ? err.message : 'Failed to export quiz. Please try again.';
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
 * Export all quizzes as a JSON file
 */
const exportAllQuizzes = async () => {
  try {
    exportLoading.value = true;
    exportError.value = '';
    exportSuccess.value = '';

    const allQuizzes = quizzesStore.quizzes;
    if (allQuizzes.length === 0) {
      exportError.value = 'No quizzes to export';
      return;
    }

    // Generate a timestamp for consistent naming
    const timestamp = new Date().toISOString().split('T')[0];
    const totalQuizzes = allQuizzes.length;
    let successfulExports = 0;

    // Export each quiz sequentially with progress tracking
    for (const quiz of allQuizzes) {
      try {
        // Generate filename for this quiz
        const safeTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `quiz_${safeTitle}_${timestamp}.json`;

        // Export this quiz
        await ApiService.exportQuiz(quiz, 'json', filename);
        successfulExports++;

        // Update progress message
        exportSuccess.value = `Exported ${successfulExports} of ${totalQuizzes} quizzes`;
      } catch (err) {
        console.error(`Error exporting quiz ${quiz.title}:`, err);
        exportError.value = `Failed to export quiz: ${err instanceof Error ? err.message : 'Unknown error'}`;
        break; // Stop on first error
      }
    }

    // Final success message if all quizzes were exported
    if (successfulExports === totalQuizzes) {
      exportSuccess.value = `Exported ${successfulExports} of ${totalQuizzes} quizzes`;
    }
  } catch (err) {
    console.error('Error exporting quizzes:', err);
    exportError.value = 'Failed to export quizzes. Please try again.';
  } finally {
    // Clear success message after 5 seconds
    setTimeout(() => {
      exportSuccess.value = '';
    }, 5000);
    exportLoading.value = false;
  }
};

/**
 * Clear export notification
 */
const clearExportNotification = () => {
  exportSuccess.value = '';
  exportError.value = '';
};

const getCurrentBestScore = () => {
  if (!quizzesStore.currentQuiz) return null;
  return quizScoresStore.getBestScoreForQuiz(quizzesStore.currentQuiz.id);
};

onMounted(() => {
  // Reset state when component mounts
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
  exportError.value = '';
  exportSuccess.value = '';
  exportLoading.value = false;
});

// Generate and download score image
// This function uses Canvas API (similar to Core Graphics in iOS)
const generateAndDownloadImage = () => {
  if (!scoreCanvas.value || !quizzesStore.currentQuiz) return;

  const canvas = scoreCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas - similar to UIGraphicsBeginImageContextWithOptions in iOS
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Setting up background - similar to setting backgroundColor in UIKit
  ctx.fillStyle = '#1F2937'; // bg-gray-800 in Tailwind
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw border - similar to CALayer's borderWidth/borderColor in iOS
  ctx.strokeStyle = '#374151'; // bg-gray-700
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Draw app title - similar to drawing attributed text in iOS
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Quiz Insanity', canvas.width / 2, 80);

  // Draw quiz title - supports up to 2 lines
  ctx.fillStyle = '#D1D5DB'; // text-gray-300
  ctx.font = '24px sans-serif';

  // Word wrap logic for title
  const maxWidth = canvas.width - 80; // 40px padding on each side
  const lineHeight = 30;
  const words = quizzesStore.currentQuiz.title.split(' ');
  let line1 = '';
  let line2 = '';
  let currentLine = 1;

  for (const word of words) {
    const testLine =
      currentLine === 1
        ? line1
          ? line1 + ' ' + word
          : word
        : line2
        ? line2 + ' ' + word
        : word;

    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine === 1 && line1) {
      currentLine = 2;
      line2 = word;
    } else if (metrics.width > maxWidth && currentLine === 2 && line2) {
      // Truncate with ellipsis
      line2 = line2.substring(0, line2.length - 3) + '...';
      break;
    } else {
      if (currentLine === 1) {
        line1 = testLine;
      } else {
        line2 = testLine;
      }
    }
  }

  // Draw the lines
  if (line1) {
    ctx.fillText(line1, canvas.width / 2, 120);
  }
  if (line2) {
    ctx.fillText(line2, canvas.width / 2, 120 + lineHeight);
  }

  // Draw score section - similar to a UIStackView in iOS
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px sans-serif';
  ctx.fillText(
    `${quizzesStore.currentQuizScore}/${quizzesStore.currentQuizQuestions.length}`,
    canvas.width / 2,
    320
  );

  // Draw percentage
  ctx.fillStyle = '#60A5FA'; // text-blue-400
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(`${getScorePercentage()}%`, canvas.width / 2, 400);

  // Draw extra info
  ctx.fillStyle = '#9CA3AF'; // text-gray-400
  ctx.font = '22px sans-serif';
  ctx.fillText(
    'Quiz completed on ' + new Date().toLocaleDateString(),
    canvas.width / 2,
    470
  );

  // Draw footer - similar to drawing at the bottom of a UIView
  ctx.fillStyle = '#6B7280'; // text-gray-500
  ctx.font = '18px sans-serif';
  ctx.fillText('Generated by Quiz Insanity', canvas.width / 2, 550);

  // Generate download - similar to UIImageJPEGRepresentation in iOS
  const imgData = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `quiz-result-${quizzesStore.currentQuiz.id.slice(0, 8)}.png`;
  link.href = imgData;
  link.click();
};
</script>

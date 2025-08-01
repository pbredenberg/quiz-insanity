<template>
  <div class="max-w-4xl mx-auto">
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
        <div
          v-for="quiz in quizzesStore.quizzes"
          :key="quiz.id"
          class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors relative group"
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
            <div class="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>{{ quiz.questions.length }} questions</span>
              <span>{{ formatDate(quiz.createdAt) }}</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <div v-if="userProfileStore.isLoggedIn" class="text-xs bg-gray-800 rounded p-2 text-blue-400">
                <span class="font-medium">Best Score:</span> {{ getBestScoreForQuiz(quiz.id) }}
              </div>
              <button
                @click.stop="editQuiz(quiz.id)"
                class="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded p-2 transition-colors"
              >
                Edit
              </button>
            </div>
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
          <button
            @click="quizzesStore.clearCurrentQuiz"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              class="h-6 w-6"
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

        <div class="flex justify-between items-center text-sm text-gray-300">
          <span
            >Question {{ currentQuestionIndex + 1 }} of
            {{ quizzesStore.currentQuizQuestions.length }}</span
          >
          <div class="flex items-center space-x-4">
            <span>Score: {{ quizzesStore.currentQuizScore }}</span>
            <span v-if="userProfileStore.isLoggedIn && getCurrentBestScore()" class="text-blue-400">
              Best: {{ getCurrentBestScore() }}
            </span>
          </div>
        </div>

        <div class="w-full bg-gray-700 rounded-full h-2 mt-4">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{
              width: `${
                ((currentQuestionIndex + 1) /
                  quizzesStore.currentQuizQuestions.length) *
                100
              }%`,
            }"
          ></div>
        </div>
      </div>

      <!-- Question -->
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
              {{ quizzesStore.currentQuizScore }}/{{
                quizzesStore.currentQuizQuestions.length
              }}
            </div>
            <div class="text-gray-300">{{ getScorePercentage() }}% Correct</div>
            <div v-if="userProfileStore.isLoggedIn && getCurrentBestScore()" class="text-sm text-blue-400 mt-2">
              Previous Best: {{ getCurrentBestScore() }}
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
              @click="quizzesStore.clearCurrentQuiz"
              class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Quizzes
            </button>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuizzesStore } from '../stores/quizzes';
import { useUserProfileStore } from '../stores/userProfile';
import { useQuizScoresStore } from '../stores/quizScores';

const quizzesStore = useQuizzesStore();
const userProfileStore = useUserProfileStore();
const quizScoresStore = useQuizScoresStore();

const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const quizCompleted = ref(false);
const scoreCanvas = ref<HTMLCanvasElement | null>(null);
const showDeleteDialog = ref(false);
const quizToDelete = ref<any>(null);

const currentQuestion = computed(() => {
  if (!quizzesStore.currentQuiz) return null;
  return quizzesStore.currentQuizQuestions[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
  return (
    currentQuestionIndex.value ===
    quizzesStore.currentQuizQuestions.length - 1
  );
});

const getBestScoreForQuiz = (quizId: string) => {
  return quizScoresStore.getBestScore(quizId);
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
};

const nextQuestion = () => {
  if (selectedAnswer.value === null) return;

  // Submit the answer
  quizzesStore.submitAnswer(currentQuestionIndex.value, selectedAnswer.value);

  if (isLastQuestion.value) {
    // Quiz completed
    quizCompleted.value = true;

    // Save score if user is logged in
    if (userProfileStore.isLoggedIn && quizzesStore.currentQuiz) {
      quizScoresStore.saveScore(
        quizzesStore.currentQuiz.id,
        quizzesStore.currentQuizScore,
        quizzesStore.currentQuizQuestions.length
      );
    }
  } else {
    // Move to next question
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    selectedAnswer.value = null;
  }
};

const restartQuiz = () => {
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
  if (quizzesStore.currentQuiz) {
    quizzesStore.startQuizAttempt(quizzesStore.currentQuiz.id);
  }
};

const editQuiz = (quizId: string) => {
  // Prevent the parent div click event from firing
  event?.stopPropagation();
  // Navigate to the edit page with the quiz ID
  window.location.href = `/quiz/edit/${quizId}`;
};

const getScorePercentage = () => {
  if (!quizzesStore.currentQuiz) return 0;
  return Math.round(
    (quizzesStore.currentQuizScore /
      quizzesStore.currentQuizQuestions.length) *
      100
  );
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

const getCurrentBestScore = () => {
  if (!quizzesStore.currentQuiz) return null;
  return getBestScoreForQuiz(quizzesStore.currentQuiz.id);
};

const showDeleteConfirmation = (quiz: any) => {
  quizToDelete.value = quiz;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  quizToDelete.value = null;
  showDeleteDialog.value = false;
};

const confirmDelete = () => {
  quizzesStore.removeQuiz(quizToDelete.value.id);
  quizToDelete.value = null;
  showDeleteDialog.value = false;
};

onMounted(() => {
  // Reset state when component mounts
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
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

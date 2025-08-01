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
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Create Your First Quiz
        </router-link>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="quiz in quizzesStore.quizzes"
          :key="quiz.id"
          class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
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
          <div v-if="userProfileStore.isLoggedIn" class="text-xs bg-gray-800 rounded p-2 text-blue-400">
            <span class="font-medium">Best Score:</span> {{ getBestScoreForQuiz(quiz.id) }}
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
              @click="quizzesStore.clearCurrentQuiz"
              class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Back to Quizzes
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
import { useQuizScoresStore } from '../stores/quizScores';
import { useUserProfileStore } from '../stores/userProfile';

const quizzesStore = useQuizzesStore();
const quizScoresStore = useQuizScoresStore();
const userProfileStore = useUserProfileStore();

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

const isLoggedIn = computed(() => userProfileStore.isLoggedIn);

const getBestScoreForQuiz = (quizId: string) => {
  const bestScore = quizScoresStore.getBestScoreForQuiz(quizId);
  return bestScore ? `${bestScore.score}/${bestScore.totalQuestions} (${Math.round(bestScore.percentage)}%)` : 'No attempts';
};

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

const getCurrentBestScore = () => {
  if (!quizzesStore.currentQuiz) return null;
  return quizScoresStore.getBestScoreForQuiz(quizzesStore.currentQuiz.id);
};

onMounted(() => {
  // Reset state when component mounts
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  quizCompleted.value = false;
});
</script>

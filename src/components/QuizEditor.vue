<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-white mb-6">
        {{ isEditing ? 'Edit Quiz' : 'Create New Quiz' }}
      </h2>

      <form @submit.prevent="saveQuiz" class="space-y-6">
        <!-- Quiz Title -->
        <div>
          <label for="quiz-title" class="block text-sm font-medium text-gray-300 mb-1">
            Quiz Title
          </label>
          <input
            id="quiz-title"
            v-model="quiz.title"
            type="text"
            required
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quiz title"
          />
        </div>

        <!-- Quiz Description -->
        <div>
          <label for="quiz-description" class="block text-sm font-medium text-gray-300 mb-1">
            Quiz Description
          </label>
          <textarea
            id="quiz-description"
            v-model="quiz.description"
            required
            rows="3"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quiz description"
          ></textarea>
        </div>

        <!-- Source URL (optional) -->
        <div>
          <label for="quiz-source" class="block text-sm font-medium text-gray-300 mb-1">
            Source URL (optional)
          </label>
          <input
            id="quiz-source"
            v-model="quiz.sourceUrl"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter source URL"
          />
        </div>

        <!-- Questions Section -->
        <div class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-white">Questions</h3>
            <button
              type="button"
              @click="addQuestion"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Add Question
            </button>
          </div>

          <!-- No Questions Message -->
          <div v-if="quiz.questions.length === 0" class="text-center py-8 bg-gray-700 rounded-lg">
            <p class="text-gray-400">No questions added yet.</p>
            <p class="text-gray-400 text-sm mt-2">
              Click the "Add Question" button to start creating your quiz.
            </p>
          </div>

          <!-- Questions List -->
          <div v-else class="space-y-6">
            <div
              v-for="(question, qIndex) in quiz.questions"
              :key="question.id"
              class="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-medium text-white">Question {{ qIndex + 1 }}</h4>
                <button
                  type="button"
                  @click="removeQuestion(qIndex)"
                  class="text-red-400 hover:text-red-300 transition-colors"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>

              <!-- Question Text -->
              <div class="mb-4">
                <label :for="`question-${qIndex}`" class="block text-sm font-medium text-gray-300 mb-1">
                  Question Text
                </label>
                <input
                  :id="`question-${qIndex}`"
                  v-model="question.question"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter question"
                />
              </div>

              <!-- Options -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Answer Options
                </label>
                <div
                  v-for="(_, oIndex) in question.options"
                  :key="oIndex"
                  class="flex items-center mb-2"
                >
                  <input
                    type="radio"
                    :id="`q${qIndex}-option${oIndex}`"
                    :name="`correct-answer-${qIndex}`"
                    :checked="question.correctAnswer === oIndex"
                    @change="question.correctAnswer = oIndex"
                    class="mr-2"
                  />
                  <input
                    :id="`q${qIndex}-option${oIndex}-text`"
                    v-model="question.options[oIndex]"
                    type="text"
                    required
                    class="flex-grow px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter option"
                  />
                  <button
                    type="button"
                    @click="removeOption(qIndex, oIndex)"
                    class="ml-2 text-red-400 hover:text-red-300 transition-colors"
                    :disabled="question.options.length <= 2"
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
                <button
                  type="button"
                  @click="addOption(qIndex)"
                  class="mt-2 text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md transition-colors duration-200"
                >
                  Add Option
                </button>
              </div>

              <!-- Explanation (optional) -->
              <div>
                <label :for="`explanation-${qIndex}`" class="block text-sm font-medium text-gray-300 mb-1">
                  Explanation (optional)
                </label>
                <textarea
                  :id="`explanation-${qIndex}`"
                  v-model="question.explanation"
                  rows="2"
                  class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter explanation for the correct answer"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between pt-6 border-t border-gray-700">
          <button
            type="button"
            @click="cancel"
            class="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {{ isEditing ? 'Save Changes' : 'Create Quiz' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizzesStore } from '../stores/quizzes';
import type { Quiz, QuizQuestion } from '../types';

const quizzesStore = useQuizzesStore();
const route = useRoute();
const router = useRouter();

// Check if we're in edit mode
const quizId = computed(() => route.params.id as string);
const isEditing = computed(() => route.path.includes('/edit/'));

// Initialize quiz object
const quiz = ref<Quiz>({
  id: '',
  title: '',
  description: '',
  sourceUrl: '',
  questions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Load quiz data if in edit mode
onMounted(() => {
  if (isEditing.value && quizId.value) {
    const existingQuiz = quizzesStore.quizzes.find(q => q.id === quizId.value);
    if (existingQuiz) {
      // Create a deep copy to avoid directly modifying the store
      quiz.value = JSON.parse(JSON.stringify(existingQuiz));
    } else {
      // If quiz not found, redirect to creation page
      router.push('/quiz/create');
    }
  }
});

// Add a new question
const addQuestion = () => {
  const newQuestion: QuizQuestion = {
    id: crypto.randomUUID(),
    question: '',
    options: ['', ''],
    correctAnswer: 0,
    explanation: ''
  };
  quiz.value.questions.push(newQuestion);
};

// Remove a question
const removeQuestion = (index: number) => {
  quiz.value.questions.splice(index, 1);
};

// Add an option to a question
const addOption = (questionIndex: number) => {
  quiz.value.questions[questionIndex].options.push('');
};

// Remove an option from a question
const removeOption = (questionIndex: number, optionIndex: number) => {
  const question = quiz.value.questions[questionIndex];
  
  // Don't allow removing if only 2 options remain
  if (question.options.length <= 2) return;
  
  // Remove the option
  question.options.splice(optionIndex, 1);
  
  // Adjust correctAnswer if needed
  if (question.correctAnswer === optionIndex) {
    question.correctAnswer = 0;
  } else if (question.correctAnswer > optionIndex) {
    question.correctAnswer--;
  }
};

// Save the quiz
const saveQuiz = () => {
  if (isEditing.value) {
    quizzesStore.updateQuiz(quizId.value, quiz.value);
  } else {
    // Create a new quiz
    const newQuiz: Quiz = {
      ...quiz.value,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    quizzesStore.addQuiz(newQuiz);
  }
  
  // Navigate back to quizzes page
  router.push('/quizzes');
};

// Cancel and go back
const cancel = () => {
  router.push('/quizzes');
};
</script>

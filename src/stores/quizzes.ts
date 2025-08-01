import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Quiz, QuizAttempt } from '../types';

export const useQuizzesStore = defineStore('quizzes', () => {
  // State
  const quizzes = ref<Quiz[]>([]);
  const currentQuiz = ref<Quiz | null>(null);
  const currentAttempt = ref<QuizAttempt | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const quizzesCount = computed(() => quizzes.value.length);
  const currentQuizQuestions = computed(
    () => currentQuiz.value?.questions || []
  );
  const currentQuizScore = computed(() => {
    if (!currentAttempt.value || !currentQuiz.value) return 0;
    return currentAttempt.value.score;
  });
  const currentQuizProgress = computed(() => {
    if (!currentAttempt.value || !currentQuiz.value) return 0;
    return (
      (currentAttempt.value.answers.length /
        currentQuiz.value.questions.length) *
      100
    );
  });

  // Actions
  const addQuiz = (quiz: Quiz) => {
    try {
      quizzes.value.push(quiz);
    } catch (err) {
      error.value = 'Failed to add quiz';
      console.error('Error adding quiz:', err);
    }
  };

  const updateQuiz = (quizId: string, updates: Partial<Quiz>) => {
    try {
      const index = quizzes.value.findIndex((q) => q.id === quizId);
      if (index !== -1) {
        quizzes.value[index] = {
          ...quizzes.value[index],
          ...updates,
          updatedAt: new Date(),
        };
      }
    } catch (err) {
      error.value = 'Failed to update quiz';
      console.error('Error updating quiz:', err);
    }
  };

  const removeQuiz = (quizId: string) => {
    try {
      quizzes.value = quizzes.value.filter((q) => q.id !== quizId);
      if (currentQuiz.value?.id === quizId) {
        currentQuiz.value = null;
      }
    } catch (err) {
      error.value = 'Failed to remove quiz';
      console.error('Error removing quiz:', err);
    }
  };

  const setCurrentQuiz = (quiz: Quiz | null) => {
    currentQuiz.value = quiz;
    currentAttempt.value = null;
  };

  const startQuizAttempt = (quizId: string) => {
    const quiz = quizzes.value.find((q) => q.id === quizId);
    if (!quiz) {
      error.value = 'Quiz not found';
      return;
    }

    try {
      currentQuiz.value = quiz;
      currentAttempt.value = {
        id: crypto.randomUUID(),
        quizId,
        answers: [],
        score: 0,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
      };
    } catch (err) {
      error.value = 'Failed to start quiz attempt';
      console.error('Error starting quiz attempt:', err);
    }
  };

  const submitAnswer = (questionIndex: number, answerIndex: number) => {
    if (!currentAttempt.value || !currentQuiz.value) return;

    try {
      // Update answers array
      currentAttempt.value.answers[questionIndex] = answerIndex;

      // Check if answer is correct
      const question = currentQuiz.value.questions[questionIndex];
      if (question && answerIndex === question.correctAnswer) {
        currentAttempt.value.score++;
      }

      // Check if quiz is completed
      if (
        currentAttempt.value.answers.length ===
        currentQuiz.value.questions.length
      ) {
        currentAttempt.value.completedAt = new Date();
      }
    } catch (err) {
      error.value = 'Failed to submit answer';
      console.error('Error submitting answer:', err);
    }
  };

  const clearCurrentQuiz = () => {
    currentQuiz.value = null;
    currentAttempt.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  return {
    // State
    quizzes,
    currentQuiz,
    currentAttempt,
    isLoading,
    error,

    // Getters
    quizzesCount,
    currentQuizQuestions,
    currentQuizScore,
    currentQuizProgress,

    // Actions
    addQuiz,
    updateQuiz,
    removeQuiz,
    setCurrentQuiz,
    startQuizAttempt,
    submitAnswer,
    clearCurrentQuiz,
    clearError,
    setLoading,
  };
});

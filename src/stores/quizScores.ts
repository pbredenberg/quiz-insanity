import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QuizScore } from '../types';
import { useUserProfileStore } from './userProfile';

export const useQuizScoresStore = defineStore('quizScores', () => {
  // State
  const scoreHistory = ref<QuizScore[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get user profile store for user ID
  const userProfileStore = useUserProfileStore();

  // Initialize from localStorage if available
  const initializeFromStorage = () => {
    try {
      const storedScores = localStorage.getItem('quizScores');
      if (storedScores) {
        // Parse dates properly from JSON
        const parsedScores = JSON.parse(storedScores, (key, value) => {
          if (key === 'completedAt') {
            return new Date(value);
          }
          return value;
        });
        scoreHistory.value = parsedScores;
      }
    } catch (err) {
      error.value = 'Failed to load score history from storage';
      console.error('Error loading score history:', err);
    }
  };

  // Call initialization on store creation
  initializeFromStorage();

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('quizScores', JSON.stringify(scoreHistory.value));
    } catch (err) {
      error.value = 'Failed to save score history to storage';
      console.error('Error saving score history:', err);
    }
  };

  // Getters
  const userScores = computed(() => {
    const userId = userProfileStore.profile?.id;
    if (!userId) return [];
    return scoreHistory.value.filter(score => score.userId === userId);
  });

  const bestScoresByQuiz = computed(() => {
    const userId = userProfileStore.profile?.id;
    if (!userId) return {};

    const bestScores: Record<string, QuizScore> = {};
    
    userScores.value.forEach(score => {
      if (
        !bestScores[score.quizId] || 
        score.percentage > bestScores[score.quizId].percentage
      ) {
        bestScores[score.quizId] = score;
      }
    });
    
    return bestScores;
  });

  const getBestScoreForQuiz = (quizId: string) => {
    return bestScoresByQuiz.value[quizId] || null;
  };

  const getScoreHistoryForQuiz = (quizId: string) => {
    const userId = userProfileStore.profile?.id;
    if (!userId) return [];
    
    return scoreHistory.value
      .filter(score => score.userId === userId && score.quizId === quizId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  };

  // Actions
  const addScore = (
    quizId: string,
    quizTitle: string,
    score: number,
    totalQuestions: number
  ) => {
    const userId = userProfileStore.profile?.id;
    if (!userId) {
      error.value = 'User not logged in';
      return;
    }

    try {
      isLoading.value = true;
      
      const percentage = (score / totalQuestions) * 100;
      
      const newScore: QuizScore = {
        id: crypto.randomUUID(),
        userId,
        quizId,
        quizTitle,
        score,
        totalQuestions,
        percentage,
        completedAt: new Date(),
      };
      
      scoreHistory.value.push(newScore);
      saveToStorage();
      
      return newScore;
    } catch (err) {
      error.value = 'Failed to add score';
      console.error('Error adding score:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearScoreHistory = () => {
    const userId = userProfileStore.profile?.id;
    if (!userId) return;
    
    try {
      scoreHistory.value = scoreHistory.value.filter(
        score => score.userId !== userId
      );
      saveToStorage();
    } catch (err) {
      error.value = 'Failed to clear score history';
      console.error('Error clearing score history:', err);
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    scoreHistory,
    isLoading,
    error,
    
    // Getters
    userScores,
    bestScoresByQuiz,
    getBestScoreForQuiz,
    getScoreHistoryForQuiz,
    
    // Actions
    addScore,
    clearScoreHistory,
    clearError,
  };
});

import { Handler } from '@netlify/functions';

/**
 * Interface for quiz question
 */
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/**
 * Interface for quiz data
 */
interface Quiz {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for import quiz request
 */
interface ImportQuizRequest {
  quizData: string; // JSON string of quiz data
  preserveId?: boolean; // Whether to preserve the original quiz ID
}

/**
 * Import quiz function
 * Validates and processes imported quiz data
 */
export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body: ImportQuizRequest = JSON.parse(event.body || '{}');
    const { quizData, preserveId = false } = body;

    if (!quizData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Quiz data is required' }),
      };
    }

    // Parse and validate the quiz data
    let quiz: Quiz;
    try {
      quiz = JSON.parse(quizData);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON format' }),
      };
    }

    // Validate required quiz fields
    if (!validateQuiz(quiz)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid quiz format' }),
      };
    }

    // Ensure the quiz has a new ID to prevent duplicates unless preserveId is true
    if (!preserveId || !quiz.id) {
      quiz.id = crypto.randomUUID();
    }
    
    // Update timestamps
    quiz.updatedAt = new Date();
    
    // If no createdAt, set it to now
    if (!quiz.createdAt) {
      quiz.createdAt = new Date();
    }

    // Return the processed quiz
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        quiz,
      }),
    };
  } catch (error) {
    console.error('Error importing quiz:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to import quiz' }),
    };
  }
};

/**
 * Validate quiz data structure
 */
function validateQuiz(quiz: any): quiz is Quiz {
  // Check if quiz has the required properties
  if (!quiz || typeof quiz !== 'object') return false;
  
  // Check required fields
  if (!quiz.title || typeof quiz.title !== 'string') return false;
  if (!quiz.description || typeof quiz.description !== 'string') return false;
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) return false;
  
  // Validate each question
  for (const question of quiz.questions) {
    if (!validateQuestion(question)) return false;
  }
  
  return true;
}

/**
 * Validate quiz question data structure
 */
function validateQuestion(question: any): boolean {
  if (!question || typeof question !== 'object') return false;
  
  // Check required fields
  if (!question.question || typeof question.question !== 'string') return false;
  if (!Array.isArray(question.options) || question.options.length < 2) return false;
  if (typeof question.correctAnswer !== 'number' || 
      question.correctAnswer < 0 || 
      question.correctAnswer >= question.options.length) return false;
  
  return true;
}

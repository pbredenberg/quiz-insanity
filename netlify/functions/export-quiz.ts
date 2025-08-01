import { Handler } from '@netlify/functions';

// Reusing the interfaces from generate-quiz.ts
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

interface ExportQuizRequest {
  quiz: Quiz;
  format: 'json'; // For now, only supporting JSON
  filename?: string; // Optional custom filename
}

interface ExportQuizResponse {
  success: boolean;
  data?: string; // The exported quiz data
  error?: string;
}

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    // Parse request body
    const body: ExportQuizRequest = JSON.parse(event.body || '{}');
    const { quiz, format, filename } = body;

    if (!quiz) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Quiz data is required',
        }),
      };
    }

    // For now, we only support JSON format
    if (format !== 'json') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Only JSON format is currently supported',
        }),
      };
    }

    // Export the quiz to JSON format
    const exportedData = JSON.stringify(quiz, null, 2);
    
    // Generate a filename if not provided
    const safeQuizTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const defaultFilename = `quiz_${safeQuizTitle}_${Date.now()}.json`;
    const downloadFilename = filename || defaultFilename;
    
    // Set headers for file download
    const downloadHeaders = {
      ...headers,
      'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      'Content-Type': 'application/json',
    };

    // For direct download, return the JSON data directly
    return {
      statusCode: 200,
      headers: downloadHeaders,
      body: exportedData, // Return the raw JSON data, not wrapped in a response object
    };
  } catch (error) {
    console.error('Error exporting quiz:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to export quiz. Please try again.',
      }),
    };
  }
};

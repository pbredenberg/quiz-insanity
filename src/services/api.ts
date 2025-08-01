// API service for connecting to Netlify functions

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions';

export interface ParseWebsiteResponse {
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
}

export interface GenerateQuizResponse {
  success: boolean;
  quiz?: any;
  error?: string;
}

export class ApiService {
  static async parseWebsite(url: string): Promise<ParseWebsiteResponse> {
    try {
      const response = await fetch(`${API_BASE}/parse-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error parsing website:', error);
      return {
        success: false,
        error: 'Failed to parse website. Please check the URL and try again.',
      };
    }
  }

  static async generateQuiz(
    content: string,
    title: string,
    quizTitle: string,
    description?: string
  ): Promise<GenerateQuizResponse> {
    try {
      const response = await fetch(`${API_BASE}/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          quizTitle,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating quiz:', error);
      return {
        success: false,
        error: 'Failed to generate quiz. Please try again.',
      };
    }
  }
}

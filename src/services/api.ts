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

export interface ExportQuizResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ImportQuizResponse {
  success: boolean;
  quiz?: any;
  error?: string;
}

export class ApiService {
  static async parseWebsite(url: string): Promise<ParseWebsiteResponse> {
    try {
      // Use CORS proxy to fetch HTML content
      const response = await fetch(`${API_BASE}/cors-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to fetch website content',
        };
      }

      // Parse the HTML content client-side
      return this.parseHtmlContent(result.html, url);
    } catch (error) {
      console.error('Error with CORS proxy:', error);
      console.log('Falling back to client-side proxy...');
      return await this.parseWebsiteClientSide(url);
    }
  }

  static parseHtmlContent(html: string, _url: string): ParseWebsiteResponse {
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract title
      const title =
        doc.querySelector('title')?.textContent?.trim() ||
        doc.querySelector('h1')?.textContent?.trim() ||
        'Untitled';

      // Remove unwanted elements
      const unwantedSelectors = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        'aside',
        '.advertisement',
        '.ads',
        '.banner',
        '.sidebar',
        '.navigation',
        '.menu',
        '.footer',
        '.header',
      ];

      unwantedSelectors.forEach((selector) => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      });

      // Extract text content
      const textContent = doc.body?.textContent || '';

      // Clean up the text
      const cleanedText = textContent
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim()
        .substring(0, 4000); // Limit to 4000 characters

      if (!cleanedText) {
        return {
          success: false,
          error: 'No readable content found on the website',
        };
      }

      return {
        success: true,
        content: cleanedText,
        title: title,
      };
    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return {
        success: false,
        error: 'Failed to parse website content',
      };
    }
  }

  static async parseWebsiteClientSide(
    url: string
  ): Promise<ParseWebsiteResponse> {
    try {
      // Import the proxy service dynamically
      const { WebsiteProxyService } = await import('./websiteProxy');
      return await WebsiteProxyService.fetchWebsite(url);
    } catch (error) {
      console.error('Error parsing website client-side:', error);
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
  
  static async exportQuiz(quiz: any, format: string = 'json', filename?: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz,
          format,
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the blob directly for download
      return await response.blob();
    } catch (error) {
      console.error('Error exporting quiz:', error);
      throw new Error('Failed to export quiz. Please try again.');
    }
  }
  
  static async importQuiz(quizData: string): Promise<ImportQuizResponse> {
    try {
      const response = await fetch(`${API_BASE}/import-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing quiz:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import quiz. Please try again.',
      };
    }
  }
  
  /**
   * Client-side validation and import of quiz data
   * This allows importing without making a server call
   */
  static validateAndImportQuiz(quizData: string): { success: boolean; quiz?: any; error?: string } {
    try {
      // Parse the quiz data
      const quiz = JSON.parse(quizData);
      
      // Basic validation
      if (!quiz || typeof quiz !== 'object') {
        return { success: false, error: 'Invalid quiz format' };
      }
      
      if (!quiz.title || typeof quiz.title !== 'string') {
        return { success: false, error: 'Quiz must have a title' };
      }
      
      if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        return { success: false, error: 'Quiz must have at least one question' };
      }
      
      // Generate a new ID to prevent duplicates
      const importedQuiz = {
        ...quiz,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
        createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date(),
      };
      
      return { success: true, quiz: importedQuiz };
    } catch (error) {
      console.error('Error validating quiz data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid quiz data format'
      };
    }
  }
}

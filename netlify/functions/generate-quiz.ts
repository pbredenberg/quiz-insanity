import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

interface GenerateQuizRequest {
  content: string;
  title: string;
  quizTitle: string;
  description?: string;
}

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

interface GenerateQuizResponse {
  success: boolean;
  quiz?: Quiz;
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

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured',
        }),
      };
    }

    // Parse request body
    const body: GenerateQuizRequest = JSON.parse(event.body || '{}');
    const { content, title, quizTitle, description } = body;

    if (!content || !title || !quizTitle) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Content, title, and quiz title are required',
        }),
      };
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Create prompt for quiz generation
    const prompt = `Based on the following website content, generate a quiz with 5 multiple choice questions. Each question should have 4 options (A, B, C, D) and only one correct answer.

Website Title: ${title}
Website Content: ${content.substring(0, 3000)}

Please generate a JSON response in the following format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is the correct answer"
    }
  ]
}

Make sure the questions are relevant to the content and test understanding of the key concepts. The correctAnswer should be the index (0-3) of the correct option.`;

    // Generate quiz using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates educational quizzes based on website content. Always respond with valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let quizData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      quizData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to parse quiz data from AI response',
        }),
      };
    }

    // Validate and format quiz data
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid quiz format from AI',
        }),
      };
    }

    // Format questions with proper structure
    const questions: QuizQuestion[] = quizData.questions.map(
      (q: any, index: number) => ({
        id: `question-${index}`,
        question: q.question || `Question ${index + 1}`,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || 'No explanation provided',
      })
    );

    // Create quiz object
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle,
      description: description || `Quiz generated from ${title}`,
      sourceUrl: '', // Will be set by frontend
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result: GenerateQuizResponse = {
      success: true,
      quiz,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error generating quiz:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to generate quiz. Please try again.',
      }),
    };
  }
};

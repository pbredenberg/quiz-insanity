import { Handler } from '@netlify/functions';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ParseWebsiteRequest {
  url: string;
}

interface ParseWebsiteResponse {
  success: boolean;
  content?: string;
  title?: string;
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
    const body: ParseWebsiteRequest = JSON.parse(event.body || '{}');
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'URL is required' }),
      };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid URL format' }),
      };
    }

    // Fetch website content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuizInsanity/1.0)',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

    // Remove script and style elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('aside').remove();

    // Extract text content
    const textContent = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000); // Limit content length

    if (!textContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No content found on the website',
        }),
      };
    }

    const result: ParseWebsiteResponse = {
      success: true,
      content: textContent,
      title,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error parsing website:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to parse website. Please check the URL and try again.',
      }),
    };
  }
};

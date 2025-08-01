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

// List of domains that are known to be problematic or slow
const PROBLEMATIC_DOMAINS = [
  'wikipedia.org',
  'github.com',
  'stackoverflow.com',
  'reddit.com',
  'medium.com',
  'dev.to',
];

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
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid URL format' }),
      };
    }

    // Check if domain is problematic
    const domain = parsedUrl.hostname.toLowerCase();
    const isProblematic = PROBLEMATIC_DOMAINS.some((problematic) =>
      domain.includes(problematic)
    );

    if (isProblematic) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error:
            'This website may be too slow or complex to parse. Please try a different website.',
        }),
      };
    }

    // Fetch website content with reduced timeout for production
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      maxRedirects: 3, // Limit redirects
      maxContentLength: 20 * 1024 * 1024, // 20MB limit
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

    // Extract text content with smaller limit
    const textContent = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000); // Reduced from 8000 to 4000 characters

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
  } catch (error: any) {
    console.error('Error parsing website:', error);

    // Handle specific error types
    let errorMessage =
      'Failed to parse website. Please check the URL and try again.';

    if (error.code === 'ECONNABORTED') {
      errorMessage =
        'Request timed out. The website may be slow or unavailable.';
    } else if (error.response?.status === 403) {
      errorMessage =
        'Access denied. This website may block automated requests.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Website not found. Please check the URL.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Website not found. Please check the URL.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The website may be down.';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
      }),
    };
  }
};

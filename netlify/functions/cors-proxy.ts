import type { Handler } from '@netlify/functions';
import axios from 'axios';

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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    console.log(`[CORS Proxy] Fetching: ${url}`);

    // Fetch the website content
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 2,
      maxContentLength: 20 * 1024 * 1024, // 20MB
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuizInsanity/1.0)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    console.log(`[CORS Proxy] Success: ${url} (${response.data.length} chars)`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        html: response.data,
        contentType: response.headers['content-type'],
        statusCode: response.status,
      }),
    };
  } catch (error: any) {
    const requestUrl = JSON.parse(event.body || '{}').url || 'unknown';
    console.error(`[CORS Proxy] Error fetching ${requestUrl}:`, error.message);

    let errorMessage = 'Failed to fetch website content';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout - website took too long to respond';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied - website blocked the request';
    } else if (error.response?.status === 404) {
      errorMessage = 'Website not found';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Website not found or unreachable';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused by website';
    }

    return {
      statusCode: 200, // Return 200 to client even if fetch failed
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
      }),
    };
  }
};

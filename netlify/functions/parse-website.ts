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

    // Performance optimizations for production
    const startTime = Date.now();

    // Log request details
    console.log(`Starting request to: ${url}`);
    console.log(`Domain: ${parsedUrl.hostname}`);
    console.log(`Protocol: ${parsedUrl.protocol}`);
    console.log(`Path: ${parsedUrl.pathname}`);

    // Fetch website content with optimized settings for production
    const response = await axios.get(url, {
      timeout: 15000, // 15 seconds - balanced for production
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 2, // Reduced redirects for speed
      maxContentLength: 20 * 1024 * 1024, // 20MB limit
      decompress: true, // Handle gzip compression
    });

    const fetchTime = Date.now() - startTime;
    console.log(`Fetch time: ${fetchTime}ms`);

    const html = response.data;

    // Optimize cheerio parsing
    const parseStart = Date.now();
    const $ = cheerio.load(html);

    // Extract title efficiently
    const title =
      $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';

    // Remove elements more efficiently
    $(
      'script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar'
    ).remove();

    // Extract text content with optimized processing
    const textContent = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000);

    const parseTime = Date.now() - parseStart;
    console.log(`Parse time: ${parseTime}ms`);

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

    const totalTime = Date.now() - startTime;
    console.log(`Total processing time: ${totalTime}ms`);

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

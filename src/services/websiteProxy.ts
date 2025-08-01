// Client-side website proxy service
// Uses public CORS proxies to fetch website content

interface ProxyResponse {
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
}

export class WebsiteProxyService {
  // List of public CORS proxies (use with caution in production)
  private static PROXY_URLS = [
    'https://api.cors.lol/?url=',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  private static currentProxyIndex = 0;

  static async fetchWebsite(url: string): Promise<ProxyResponse> {
    const proxyUrl = this.PROXY_URLS[this.currentProxyIndex];

    try {
      console.log(`Fetching via proxy: ${proxyUrl}${url}`);

      const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse HTML on client side
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract title
      const title =
        doc.querySelector('title')?.textContent?.trim() ||
        doc.querySelector('h1')?.textContent?.trim() ||
        'Untitled';

      // Extract text content
      const body = doc.querySelector('body');
      if (!body) {
        return {
          success: false,
          error: 'No body content found',
        };
      }

      // Remove unwanted elements
      const unwantedSelectors =
        'script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar';
      body.querySelectorAll(unwantedSelectors).forEach((el) => el.remove());

      // Extract text
      const textContent =
        body.textContent?.replace(/\s+/g, ' ')?.trim()?.substring(0, 4000) ||
        '';

      if (!textContent) {
        return {
          success: false,
          error: 'No text content found',
        };
      }

      return {
        success: true,
        content: textContent,
        title,
      };
    } catch (error) {
      console.error('Proxy fetch failed:', error);

      // Try next proxy if available
      if (this.currentProxyIndex < this.PROXY_URLS.length - 1) {
        this.currentProxyIndex++;
        console.log(`Retrying with proxy ${this.currentProxyIndex + 1}`);
        return this.fetchWebsite(url);
      }

      return {
        success: false,
        error: 'Failed to fetch website content. All proxies failed.',
      };
    }
  }

  // Reset proxy index
  static resetProxyIndex() {
    this.currentProxyIndex = 0;
  }
}

/**
 * Brave Search API Utility
 * Fetches verified information from official Israeli government sources
 */

const BRAVE_API_KEY = process.env.BRAVE_SEARCH_API_KEY;
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export interface BraveSearchResponse {
  query: string;
  results: BraveSearchResult[];
  total: number;
}

/**
 * Search for Israeli government information using Brave Search API
 * Focuses on official .gov.il domains for verified information
 */
export async function searchIsraeliGovInfo(query: string, limit: number = 5): Promise<BraveSearchResponse> {
  if (!BRAVE_API_KEY) {
    throw new Error('Brave Search API key not configured');
  }

  // Add site filter for Israeli government domains
  const govQuery = `${query} site:gov.il`;

  try {
    const response = await fetch(
      `${BRAVE_API_URL}?q=${encodeURIComponent(govQuery)}&count=${limit}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': BRAVE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse results
    const results: BraveSearchResult[] = (data.web?.results || []).map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      age: result.age,
    }));

    return {
      query: query,
      results,
      total: data.web?.results?.length || 0,
    };
  } catch (error) {
    console.error('Brave Search API error:', error);
    throw error;
  }
}

/**
 * Search for specific Israeli compliance topic
 */
export async function searchComplianceTopic(topic: string): Promise<BraveSearchResponse> {
  const queries: Record<string, string> = {
    'vat': 'מס ערך מוסף מע"מ דיווח',
    'income_tax': 'מס הכנסה דוח שנתי מקדמות',
    'social_security': 'ביטוח לאומי עצמאי דיווח',
    'business_license': 'רישיון עסק חידוש',
    'payroll': 'תלושי שכר חוק שכר',
  };

  const searchQuery = queries[topic] || topic;
  return searchIsraeliGovInfo(searchQuery);
}

/**
 * Get official government links for a task category
 */
export async function getOfficialLinks(category: string): Promise<string[]> {
  try {
    const result = await searchComplianceTopic(category);
    return result.results
      .filter(r => r.url.includes('.gov.il'))
      .map(r => r.url)
      .slice(0, 3); // Top 3 official links
  } catch (error) {
    console.error('Failed to get official links:', error);
    return [];
  }
}

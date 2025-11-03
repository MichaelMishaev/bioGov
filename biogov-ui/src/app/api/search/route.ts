/**
 * Brave Search API Endpoint
 * Search official Israeli government sources for compliance information
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchIsraeliGovInfo, searchComplianceTopic } from '@/lib/braveSearch';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query && !topic) {
      return NextResponse.json(
        { error: 'Query parameter "q" or "topic" is required' },
        { status: 400 }
      );
    }

    let results;
    if (topic) {
      results = await searchComplianceTopic(topic);
    } else if (query) {
      results = await searchIsraeliGovInfo(query, limit);
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search',
      },
      { status: 500 }
    );
  }
}

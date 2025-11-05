import { NextRequest, NextResponse } from 'next/server';

// GET - Check if API key is configured
export async function GET() {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

    return NextResponse.json({
      hasApiKey,
      message: hasApiKey ? 'API key is configured' : 'API key not configured',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check API key status' },
      { status: 500 }
    );
  }
}

// POST - Store API key (in session/cookie for client-side usage)
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Return success - the key will be stored client-side
    return NextResponse.json({
      success: true,
      message: 'API key will be stored in your browser',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process API key' },
      { status: 500 }
    );
  }
}

// DELETE - Clear API key
export async function DELETE() {
  try {
    return NextResponse.json({
      success: true,
      message: 'API key cleared',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear API key' },
      { status: 500 }
    );
  }
}

/**
 * API Route: Validate Gemini API Key
 *
 * Verifies that a provided Google Gemini API key is valid and functional
 * by making a test request to the Gemini API.
 *
 * Endpoint: POST /api/settings/validate-key
 *
 * Request Body:
 * {
 *   apiKey: string  // Gemini API key to validate
 * }
 *
 * Response:
 * Success: { valid: true, message: string }
 * Error: { valid: false, error: string }
 *
 * Use Case:
 * Called by Settings component before saving API key to sessionStorage.
 * Prevents users from saving invalid keys that would cause extraction failures.
 *
 * @route POST /api/settings/validate-key
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST handler - Validate Google Gemini API key
 *
 * Workflow:
 * 1. Extract API key from request body
 * 2. Validate key format (non-empty string)
 * 3. Initialize GoogleGenerativeAI client with key
 * 4. Make test request to Gemini API
 * 5. Return validation result
 *
 * @param {NextRequest} request - Incoming HTTP request with { apiKey: string }
 * @returns {Promise<NextResponse>} JSON response with validation result
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key from request body
    const { apiKey } = await request.json();

    // Validation Check #1: Ensure API key is a non-empty string
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validation Check #2: Test API key by making actual request to Gemini
    try {
      // Initialize Gemini client with provided API key
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Test the API key with a simple "Hello" request
      // If this succeeds, the key is valid and has proper permissions
      const result = await model.generateContent('Hello');
      const response = await result.response;

      // Verify we received a valid response with text content
      if (response && typeof response.text === 'function') {
        const text = response.text();
        if (text) {
          return NextResponse.json({
            valid: true,
            message: 'API key is valid and working',
          });
        }
      }

      // Edge case: Response received but no text content
      return NextResponse.json(
        { valid: false, error: 'API key validation failed' },
        { status: 400 }
      );
    } catch (error: any) {
      // Error Handler: Catch Gemini API errors during validation

      // Handle authentication errors (invalid key)
      if (error.message?.includes('API key')) {
        return NextResponse.json(
          { valid: false, error: 'Invalid API key' },
          { status: 400 }
        );
      }

      // Handle other API errors (rate limits, network issues, etc.)
      return NextResponse.json(
        { valid: false, error: error.message || 'Failed to validate API key' },
        { status: 400 }
      );
    }
  } catch (error) {
    // Outer Error Handler: Catch JSON parsing errors or other request issues
    return NextResponse.json(
      { valid: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

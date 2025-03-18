import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// Check if API key is available
if (!GEMINI_API_KEY) {
  console.warn('Gemini API key is not set. Please add it to your .env file as EXPO_PUBLIC_GEMINI_API_KEY=your_api_key');
}

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); 
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory,  } from '@google/generative-ai';
// Types for our Gemini API service
export interface RemoveSubjectResult {
  success: boolean;
  resultImageUri?: string;
  error?: string;
}

// Define the structure for the Gemini API response parts
interface GeminiResponsePart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

// Get the API key directly from environment variables
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Check if API key is available
if (!GEMINI_API_KEY) {
  console.warn('Gemini API key is not set. Please add it to your .env file as EXPO_PUBLIC_GEMINI_API_KEY=your_api_key');
}

/**
 * Converts a local file to base64
 * @param uri Local URI of the image
 * @returns Base64 string of the image
 */
async function getBase64FromUri(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}

/**
 * Prepares image data for Gemini
 * @param path Local path of the image
 * @param mimeType MIME type of the image
 * @returns Image data object for Gemini
 */
async function prepareImageData(path: string, mimeType: string) {
  const base64Data = await getBase64FromUri(path);
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

/**
 * Removes a subject from a target photo using Gemini API
 * @param subjectPhotoUri The URI of the subject photo to be removed
 * @param targetPhotoUri The URI of the target photo to remove the subject from
 * @param prompt The prompt for the Gemini API
 * @returns The result of the removal operation
 */
export const removeSubjectFromPhoto = async (
  subjectPhotoUri: string,
  targetPhotoUri: string,
  prompt: string
): Promise<{ success: boolean; localUri?: string; error?: string }> => {
  try {
    const images = await Promise.all([
      prepareImageData(subjectPhotoUri, getMimeType(subjectPhotoUri)),
      prepareImageData(targetPhotoUri, getMimeType(targetPhotoUri)),
    ]);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Configure the model with updated settings
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        // @ts-expect-error - Gemini API JS is missing this type
        responseModalities: ["Text", "Image"],
      },
    });

    // Create message parts array
    const messageParts = [
      images[0],
      images[1],
      { text: 'Remove the person from images[0] from images[1].' }
    ];

    // Start chat session and send message
    const chat = model.startChat();
    const result = await chat.sendMessage(messageParts);

    // Process the response
    let imageData = null;
    let textResponse = null;

    if (result.response.candidates && result.response.candidates.length > 0) {
      const parts = result.response.candidates[0].content.parts;
      
      for (const part of parts) {
        if ("inlineData" in part && part.inlineData) {
          imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if ("text" in part && part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      throw new Error("No image was generated in the response");
    }

    return {
      success: true,
      localUri: imageData,
    };
    
  } catch (error) {
    console.error("Error removing subject from photo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Gets the MIME type based on file extension
 * @param uri The file URI
 * @returns The MIME type
 */
const getMimeType = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Default to JPEG
  }
}; 
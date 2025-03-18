declare module '@env' {
  export const GEMINI_API_KEY: string;
  export const EXPO_PUBLIC_SUPERWALL_API_KEY_IOS: string;
  export const EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID: string;
}

// Extend ExpoConfig to include our custom extra fields
declare module 'expo-constants' {
  interface Constants {
    expoConfig: {
      extra: {
        geminiApiKey: string;
      };
    };
  }
} 
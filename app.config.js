import 'dotenv/config';

// Get the app.json configuration
const appJson = require('./app.json');

// Add environment variables to the extra field
export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    },
    // Expose environment variables to the JavaScript code
    plugins: [
      ...appJson.expo.plugins || [],
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    // Add environment variables that should be available at runtime
    runtimeConfig: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    },
  },
}; 
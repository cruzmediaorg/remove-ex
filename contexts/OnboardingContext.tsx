import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSegments, useRouter } from 'expo-router';

type OnboardingContextType = {
  isOnboarded: boolean;
  isLoading: boolean;
  setIsOnboarded: (value: boolean) => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'isOnboarded';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'onboarding';

    if (!isOnboarded && !inAuthGroup) {
      // Use setTimeout to ensure navigation happens after initial render
      setTimeout(() => {
        router.push('/onboarding');
      }, 0);
    } else if (isOnboarded && inAuthGroup) {
      setTimeout(() => {
        router.push('/');
      }, 0);
    }
  }, [isOnboarded, segments, isLoading]);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      setIsOnboarded(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setOnboardingStatus = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, value.toString());
      setIsOnboarded(value);
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded,
        isLoading,
        setIsOnboarded: setOnboardingStatus,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 
import { useCallback, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { ProgressDots } from '@/components/ProgressDots';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { setIsOnboarded } = useOnboarding();

  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const handleContinue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setIsOnboarded(true);
    router.replace('/');
  }, [setIsOnboarded, router]);

  if (!fontsLoaded) return null;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.header}
          >
            <LottieView
              source={require('@/assets/images/remove-ex.json')}
              autoPlay
              style={styles.lottieAnimation}
              loop={false}
            />
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(600)}
            style={styles.demoContainer}
          >
            <BeforeAfterSlider
              beforeImage={require('@/assets/images/after.jpeg')}
              afterImage={require('@/assets/images/before.jpg')}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(900)}
            style={styles.footer}
          >
            <ThemedText style={styles.subtitle}>
              Just like your ex, they'll be gone{'\n'}in a snap!
            </ThemedText>

            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Get Started</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.terms}>
              By proceeding, you accept our{' '}
              <ThemedText style={styles.link}>Terms of Use</ThemedText> and{' '}
              <ThemedText style={styles.link}>Privacy Policy</ThemedText>
            </ThemedText>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingVertical: 24,
  },
  lottieAnimation: {
    width: 200,
    height: 100,
  },
  title: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 36,
    color: '#fff',
    textAlign: 'center',
  },
  highlight: {
    color: '#8B5CF6',
    fontFamily: 'Figtree_700Bold',
  },
  demoContainer: {
    alignItems: 'center',
    gap: 24,
  },
  subtitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Figtree_600SemiBold',
  },
  terms: {
    marginTop: 16,
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
    fontFamily: 'Figtree_400Regular',
    textAlign: 'center',
  },
  link: {
    color: '#8B5CF6',
    textDecorationLine: 'underline',
    fontFamily: 'Figtree_400Regular',
  },
}); 
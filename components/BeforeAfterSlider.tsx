import { useState } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.85;

type Props = {
  beforeImage: any;
  afterImage: any;
};

export function BeforeAfterSlider({ beforeImage, afterImage }: Props) {
  const sliderPosition = useSharedValue(SLIDER_WIDTH / 2);
  const [imageHeight, setImageHeight] = useState(200);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = sliderPosition.value;
    },
    onActive: (event, ctx) => {
      const newPosition = ctx.startX + event.translationX;
      sliderPosition.value = Math.min(Math.max(0, newPosition), SLIDER_WIDTH);
    },
    onEnd: () => {
      runOnJS(triggerHaptic)();
    },
  });

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPosition.value }],
  }));

  const beforeImageStyle = useAnimatedStyle(() => ({
    width: sliderPosition.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={afterImage}
          style={styles.image}
          onLayout={(event) => setImageHeight(event.nativeEvent.layout.height)}
        />
        <Animated.View style={[styles.beforeContainer, beforeImageStyle]}>
          <Image source={beforeImage} style={styles.image} />
        </Animated.View>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.slider, sliderStyle]}>
            <View style={styles.sliderLine} />
            <View style={styles.sliderKnob} />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    width: SLIDER_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beforeContainer: {
    position: 'absolute',
    height: '100%',
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLine: {
    width: 3,
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  sliderKnob: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 
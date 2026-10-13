import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { create } from 'zustand';

import { colors, radii, spacing, typography } from '../theme';

const VISIBLE_MS = 1800;

type ToastState = {
  message: string | null;
  /** Bumped on every show so repeated identical toasts restart the timer. */
  key: number;
};

const useToastStore = create<ToastState>()(() => ({ message: null, key: 0 }));

export function showToast(message: string) {
  useToastStore.setState(state => ({ message, key: state.key + 1 }));
}

/** Mount once near the root of a screen. */
export function ToastHost({ bottomOffset }: { bottomOffset: number }) {
  const { message, key } = useToastStore();

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(
      () => useToastStore.setState({ message: null }),
      VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [message, key]);

  if (!message) {
    return null;
  }
  return (
    <Animated.View
      key={key}
      entering={FadeInDown}
      exiting={FadeOutDown}
      pointerEvents="none"
      style={[styles.toast, { bottom: bottomOffset }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.captionStrong,
    color: colors.surface,
  },
});

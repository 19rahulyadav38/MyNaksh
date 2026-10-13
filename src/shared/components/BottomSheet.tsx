import { useEffect, type ReactNode } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Read by screen readers for the backdrop's dismiss action. */
  dismissLabel: string;
  children: ReactNode;
};

/**
 * In-screen bottom sheet: backdrop, slide-in panel, Android back to close.
 * Rendered as an absolute overlay rather than a `Modal`, because Android Modal
 * windows don't extend under the navigation bar in edge-to-edge mode. Mount it
 * as the last child of the screen.
 */
export function BottomSheet({
  visible,
  onClose,
  dismissLabel,
  children,
}: Props) {
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [onClose, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={StyleSheet.absoluteFill}
      >
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={dismissLabel}
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(200)}
        exiting={SlideOutDown.duration(180)}
        style={[styles.sheet, { paddingBottom: bottom + spacing.md }]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
});

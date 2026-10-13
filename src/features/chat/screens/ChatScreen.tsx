import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { ToastHost } from '../../../shared/components/Toast';
import { colors, spacing } from '../../../shared/theme';
import { TourButton } from '../../tour/TourButton';
import { TourSheet } from '../../tour/TourSheet';
import { useTourStore } from '../../tour/tourStore';
import type { TourContext } from '../../tour/tourSteps';
import type { LoadScenario } from '../api/chatApi';
import { MessageActionSheet } from '../components/actions/MessageActionSheet';
import { Composer } from '../components/composer/Composer';
import {
  DevScenarioToggle,
  nextScenario,
} from '../components/dev/DevScenarioToggle';
import { EmptyState } from '../components/states/EmptyState';
import { ErrorState } from '../components/states/ErrorState';
import { LoadingState } from '../components/states/LoadingState';
import { Timeline, type TimelineRef } from '../components/timeline/Timeline';
import { useChatStore } from '../store/chatStore';

const TOAST_OFFSET = 96;
/** Let the conversation render before the tour slides over it. */
const TOUR_AUTO_OPEN_DELAY_MS = 800;

export function ChatScreen() {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const listRef = useRef<TimelineRef>(null);

  const loadState = useChatStore(state => state.loadState);
  const isEmpty = useChatStore(state => state.order.length === 0);
  const load = useChatStore(state => state.load);
  const send = useChatStore(state => state.send);

  const [scenario, setScenario] = useState<LoadScenario>('ok');

  const renderHeaderRight = useCallback(
    () => (
      <View style={styles.headerRight}>
        {__DEV__ ? (
          <DevScenarioToggle
            scenario={scenario}
            onPress={() => setScenario(nextScenario)}
          />
        ) : null}
        <TourButton />
      </View>
    ),
    [scenario],
  );

  useEffect(() => {
    load({ scenario });
  }, [load, scenario]);

  // Tour entry point, plus (dev builds only) the load-scenario toggle.
  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: renderHeaderRight });
  }, [navigation, renderHeaderRight]);

  // Offer the guided tour once, after the conversation first loads.
  useEffect(() => {
    if (loadState !== 'success') {
      return;
    }
    const timer = setTimeout(
      () => useTourStore.getState().openOnce(),
      TOUR_AUTO_OPEN_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [loadState]);

  const tourContext = useMemo<TourContext>(
    () => ({
      scrollToEnd: () => listRef.current?.scrollToEnd(),
      scrollToTop: () => listRef.current?.scrollToTop(),
    }),
    [],
  );

  // Retrying recovers to the happy path (in dev, the forced error scenario is cleared).
  const retryLoad = useCallback(() => {
    if (scenario === 'ok') {
      load({ scenario });
    } else {
      setScenario('ok');
    }
  }, [load, scenario]);

  const handleSend = useCallback(
    (text: string) => {
      send(text);
      // Your own message always scrolls into view, wherever you were.
      requestAnimationFrame(() => listRef.current?.scrollToEnd());
    },
    [send],
  );

  const renderBody = () => {
    switch (loadState) {
      case 'idle':
      case 'loading':
        return <LoadingState />;
      case 'error':
        return <ErrorState onRetry={retryLoad} />;
      case 'success':
        return isEmpty ? (
          <EmptyState onSuggestion={handleSend} />
        ) : (
          <Timeline ref={listRef} />
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
      style={styles.container}
    >
      <View style={styles.body}>{renderBody()}</View>
      {loadState === 'success' ? <Composer onSend={handleSend} /> : null}
      <MessageActionSheet />
      <TourSheet context={tourContext} />
      <ToastHost bottomOffset={TOAST_OFFSET} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

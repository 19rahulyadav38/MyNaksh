import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { ToastHost } from '../../../shared/components/Toast';
import { colors } from '../../../shared/theme';
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

export function ChatScreen() {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const listRef = useRef<TimelineRef>(null);

  const loadState = useChatStore(state => state.loadState);
  const isEmpty = useChatStore(state => state.order.length === 0);
  const load = useChatStore(state => state.load);
  const send = useChatStore(state => state.send);

  const [scenario, setScenario] = useState<LoadScenario>('ok');

  const renderDevToggle = useCallback(
    () => (
      <DevScenarioToggle
        scenario={scenario}
        onPress={() => setScenario(nextScenario)}
      />
    ),
    [scenario],
  );

  useEffect(() => {
    load({ scenario });
  }, [load, scenario]);

  // Dev-only: cycle load scenarios so every state can be demoed.
  useLayoutEffect(() => {
    if (!__DEV__) {
      return;
    }
    navigation.setOptions({ headerRight: renderDevToggle });
  }, [navigation, renderDevToggle]);

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
});

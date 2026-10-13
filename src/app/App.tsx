import { StatusBar } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation';

export function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

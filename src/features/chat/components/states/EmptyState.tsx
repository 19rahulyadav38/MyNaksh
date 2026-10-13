import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '../../../../shared/components/Chip';
import { colors, spacing, typography } from '../../../../shared/theme';

const SUGGESTIONS = [
  'How is my career this year?',
  'When will I get married?',
  'How can I reduce stress?',
];

type Props = {
  onSuggestion: (text: string) => void;
};

export function EmptyState({ onSuggestion }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔮</Text>
      <Text style={styles.title}>Start your conversation.</Text>
      <Text style={styles.subtitle}>
        Ask anything about your chart, or try one of these:
      </Text>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map(suggestion => (
          <Chip
            key={suggestion}
            label={suggestion}
            onPress={() => onSuggestion(suggestion)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  suggestions: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});

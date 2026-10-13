import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { MessageRow } from '../src/features/chat/components/timeline/MessageRow';
import type { AiMessage } from '../src/features/chat/model/types';
import { recommendationRegistry } from '../src/features/chat/recommendations/registry';
import { RecommendationRail } from '../src/features/chat/recommendations/RecommendationRail';
import type { Recommendation } from '../src/features/chat/recommendations/types';
import { useChatStore } from '../src/features/chat/store/chatStore';

const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'gemstone',
    title: 'Blue Sapphire',
    subtitle: 'Recommended for Saturn',
  },
  { id: '2', type: 'article', title: 'Understanding Saturn Mahadasha' },
];

describe('RecommendationRail', () => {
  beforeEach(() => jest.spyOn(Alert, 'alert').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('renders one card per recommendation with type-specific content', async () => {
    await render(
      <RecommendationRail
        messageId="m1"
        recommendations={recommendations}
        inset={0}
      />,
    );

    expect(screen.getByText('Blue Sapphire')).toBeTruthy();
    expect(screen.getByText('GEMSTONE')).toBeTruthy();
    expect(screen.getByText('5 min read')).toBeTruthy(); // ArticleCard body
  });

  it('routes card taps through the single press handler', async () => {
    await render(
      <RecommendationRail
        messageId="m1"
        recommendations={recommendations}
        inset={0}
      />,
    );

    await fireEvent.press(screen.getByLabelText(/Gemstone: Blue Sapphire/));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Blue Sapphire',
      'Gemstone · View gemstone',
    );
  });

  it('isolates a crashing card body without breaking the rest of the rail', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const original = recommendationRegistry.gemstone.Content;
    recommendationRegistry.gemstone.Content = () => {
      throw new Error('bad payload');
    };
    try {
      await render(
        <RecommendationRail
          messageId="m1"
          recommendations={recommendations}
          inset={0}
        />,
      );
      // The shell (title/CTA) still renders, and sibling cards are unaffected.
      expect(screen.getByText('Blue Sapphire')).toBeTruthy();
      expect(screen.getByText('5 min read')).toBeTruthy();
    } finally {
      recommendationRegistry.gemstone.Content = original;
    }
  });
});

describe('AI message feedback', () => {
  const message: AiMessage = {
    id: 'a1',
    type: 'ai',
    text: 'Saturn is strong',
    createdAt: 1,
  };

  beforeEach(() => {
    useChatStore.setState({
      byId: { a1: message },
      order: ['a1'],
      loadState: 'success',
      actionTargetId: null,
      replyTarget: null,
    });
  });

  const renderRow = () =>
    render(<MessageRow messageId="a1" isFirstInGroup isLastInGroup />);

  it('expands reason chips on dislike and records the selection', async () => {
    await renderRow();
    expect(screen.queryByText('What went wrong?')).toBeNull();

    await fireEvent.press(screen.getByLabelText('Not helpful'));
    expect(screen.getByText('What went wrong?')).toBeTruthy();

    await fireEvent.press(screen.getByText('Too Long'));
    expect((useChatStore.getState().byId.a1 as AiMessage).feedback).toEqual({
      value: 'dislike',
      reasons: ['Too Long'],
    });
  });

  it('collapses chips when switching to like', async () => {
    await renderRow();
    await fireEvent.press(screen.getByLabelText('Not helpful'));
    await fireEvent.press(screen.getByLabelText('Helpful'));

    expect(screen.queryByText('What went wrong?')).toBeNull();
    expect(screen.getByText('Thanks for the feedback')).toBeTruthy();
  });

  it('opens the action sheet target on long press', async () => {
    await renderRow();
    await fireEvent(
      screen.getByLabelText('AI Astrologer: Saturn is strong'),
      'longPress',
    );
    expect(useChatStore.getState().actionTargetId).toBe('a1');
  });
});

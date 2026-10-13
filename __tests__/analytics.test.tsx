import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import {
  resetImpressionsForTests,
  trackRecommendationImpression,
} from '../src/features/chat/analytics';
import type { AiMessage } from '../src/features/chat/model/types';
import { RecommendationRail } from '../src/features/chat/recommendations/RecommendationRail';
import type { Recommendation } from '../src/features/chat/recommendations/types';
import { useChatStore } from '../src/features/chat/store/chatStore';
import {
  setAnalyticsSink,
  track,
  type AnalyticsEvent,
} from '../src/shared/analytics/analytics';

const tarot: Recommendation = {
  id: 'r1',
  type: 'tarot',
  title: 'Career Tarot',
};
const remedy: Recommendation = {
  id: 'r2',
  type: 'remedy',
  title: 'Thursday Remedy',
};

let events: AnalyticsEvent[];

beforeEach(() => {
  events = [];
  setAnalyticsSink(event => events.push(event));
  resetImpressionsForTests();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('analytics', () => {
  it('records a tap with message and position context', async () => {
    await render(
      <RecommendationRail
        messageId="m1"
        recommendations={[tarot, remedy]}
        inset={0}
      />,
    );
    await fireEvent.press(screen.getByLabelText(/Remedy: Thursday Remedy/));

    expect(events).toEqual([
      {
        name: 'recommendation_tap',
        properties: {
          message_id: 'm1',
          recommendation_id: 'r2',
          recommendation_type: 'remedy',
          position: 1,
        },
      },
    ]);
  });

  it('logs each impression once per card', () => {
    trackRecommendationImpression(tarot, { messageId: 'm1', position: 0 });
    trackRecommendationImpression(tarot, { messageId: 'm1', position: 0 });
    trackRecommendationImpression(tarot, { messageId: 'm2', position: 0 });

    expect(events.map(e => e.properties?.message_id)).toEqual(['m1', 'm2']);
  });

  it('records AI feedback changes, and nothing for no-op updates', () => {
    const message: AiMessage = {
      id: 'a1',
      type: 'ai',
      text: 'x',
      createdAt: 1,
    };
    useChatStore.setState({ byId: { a1: message }, order: ['a1'] });

    useChatStore.getState().toggleFeedbackReason('a1', 'Too Long'); // not disliked: no-op
    useChatStore.getState().setFeedback('a1', 'dislike');
    useChatStore.getState().toggleFeedbackReason('a1', 'Too Long');

    expect(events).toEqual([
      {
        name: 'ai_feedback',
        properties: { message_id: 'a1', value: 'dislike', reasons: [] },
      },
      {
        name: 'ai_feedback',
        properties: {
          message_id: 'a1',
          value: 'dislike',
          reasons: ['Too Long'],
        },
      },
    ]);
  });

  it('never lets a failing sink break the caller', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    setAnalyticsSink(() => {
      throw new Error('sdk down');
    });
    expect(() => track({ name: 'anything' })).not.toThrow();
  });
});

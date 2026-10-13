import { mockConfig } from '../src/features/chat/api/chatApi';
import { useChatStore } from '../src/features/chat/store/chatStore';
import { useTourStore } from '../src/features/tour/tourStore';
import { TOUR_STEPS, type TourContext } from '../src/features/tour/tourSteps';
import { track } from '../src/shared/analytics/analytics';

const context: TourContext = { scrollToEnd: jest.fn(), scrollToTop: jest.fn() };
const tour = () => useTourStore.getState();

beforeAll(() => {
  mockConfig.sendDelayMs = [0, 0];
  mockConfig.replyDelayMs = [0, 0];
});

beforeEach(() => {
  useTourStore.setState({ isOpen: false, hasAutoOpened: false });
  tour().reset();
});

describe('tour store', () => {
  it('auto-opens only once per session', () => {
    tour().openOnce();
    expect(tour().isOpen).toBe(true);
    tour().close();
    tour().openOnce();
    expect(tour().isOpen).toBe(false);
  });

  it('completes event-driven steps when the reviewer performs the action', () => {
    track({ name: 'recommendation_tap' });
    track({ name: 'ai_feedback' });
    expect([...tour().completed].sort()).toEqual(['cards', 'feedback']);
  });

  it('counts analytics events for the live analytics step', () => {
    track({ name: 'recommendation_impression' });
    track({ name: 'something_else' });
    expect(tour().eventCount).toBe(2);
  });
});

describe('tour steps', () => {
  it('have unique ids', () => {
    const ids = TOUR_STEPS.map(step => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only complete on events the app actually emits', () => {
    const emitted = new Set([
      'recommendation_tap',
      'recommendation_impression',
      'ai_feedback',
    ]);
    for (const step of TOUR_STEPS) {
      if (step.completesOn) {
        expect(emitted).toContain(step.completesOn);
      }
    }
  });

  it('the error-state demo puts the screen into the error state', async () => {
    const step = TOUR_STEPS.find(s => s.id === 'states')!;
    useChatStore.setState({ loadState: 'success' });
    step.run(context);
    await new Promise<void>(resolve => setTimeout(resolve, 700));
    expect(useChatStore.getState().loadState).toBe('error');
  });

  it('the send demo fails first, so retry can be shown', async () => {
    await useChatStore.getState().load({ delayMs: 0 });
    TOUR_STEPS.find(s => s.id === 'send')!.run(context);
    await new Promise<void>(resolve => setTimeout(resolve, 10));

    const { order, byId } = useChatStore.getState();
    const last = byId[order[order.length - 1]!];
    expect(last).toMatchObject({ type: 'user', status: 'failed' });
  });
});

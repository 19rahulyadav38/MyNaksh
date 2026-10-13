import { createSeedConversation } from '../src/features/chat/api/mockData';
import { parseMessages } from '../src/features/chat/model/parse';
import { parseRecommendations } from '../src/features/chat/recommendations/parse';
import { recommendationRegistry } from '../src/features/chat/recommendations/registry';

describe('parseRecommendations', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('keeps known types', () => {
    const parsed = parseRecommendations([
      {
        id: '1',
        type: 'gemstone',
        title: 'Blue Sapphire',
        subtitle: 'For Saturn',
      },
      { id: '2', type: 'tarot', title: 'Career Tarot' },
    ]);
    expect(parsed.map(r => r.type)).toEqual(['gemstone', 'tarot']);
  });

  it('drops unknown types instead of crashing (forward compatibility)', () => {
    const parsed = parseRecommendations([
      { id: '1', type: 'panchang', title: 'Today’s Panchang' },
      { id: '2', type: 'article', title: 'Saturn Mahadasha' },
    ]);
    expect(parsed.map(r => r.id)).toEqual(['2']);
  });

  it('drops malformed entries', () => {
    expect(
      parseRecommendations([
        null,
        'x',
        { type: 'tarot' },
        { id: '1', type: 'tarot', title: '' },
      ]),
    ).toEqual([]);
  });

  it('does not treat inherited object keys as registered types', () => {
    expect(
      parseRecommendations([{ id: '1', type: 'toString', title: 'x' }]),
    ).toEqual([]);
  });

  it('returns [] for non-array input', () => {
    expect(parseRecommendations(undefined)).toEqual([]);
  });
});

describe('recommendationRegistry', () => {
  it('provides a complete renderer for every registered type', () => {
    for (const renderer of Object.values(recommendationRegistry)) {
      expect(renderer.Content).toEqual(expect.any(Function));
      expect(renderer.label).toBeTruthy();
      expect(renderer.icon).toBeTruthy();
      expect(renderer.defaultCtaLabel).toBeTruthy();
    }
  });
});

describe('parseMessages', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('parses the spec payload into all four message types', () => {
    const messages = parseMessages(createSeedConversation());
    expect(new Set(messages.map(m => m.type))).toEqual(
      new Set(['system', 'user', 'ai', 'human']),
    );
  });

  it('marks server user messages as sent and keeps recommendations on AI messages', () => {
    const [u, a] = parseMessages([
      { id: '1', type: 'user', text: 'hi', createdAt: 1 },
      {
        id: '2',
        type: 'ai',
        text: 'yo',
        createdAt: 2,
        recommendations: [{ id: 'r', type: 'tarot', title: 'T' }],
      },
    ]);
    expect(u).toMatchObject({ type: 'user', status: 'sent' });
    expect(a).toMatchObject({ type: 'ai', recommendations: [{ id: 'r' }] });
  });

  it('drops unknown message types and malformed messages', () => {
    const messages = parseMessages([
      { id: '1', type: 'video', text: 'x' },
      { id: 2, type: 'user', text: 'x' },
      { id: '3', type: 'system', text: 'ok' },
    ]);
    expect(messages.map(m => m.id)).toEqual(['3']);
  });

  it('falls back to "now" when createdAt is missing', () => {
    const [m] = parseMessages([{ id: '1', type: 'system', text: 'x' }], 42);
    expect(m?.createdAt).toBe(42);
  });
});

describe('remedy recommendations', () => {
  it('are accepted once registered, with no changes to parsing or rendering code', () => {
    const [remedy] = parseRecommendations([
      {
        id: '1',
        type: 'remedy',
        title: 'Thursday Jupiter Remedy',
        day: 'Thursday',
      },
    ]);
    expect(remedy).toMatchObject({ type: 'remedy', day: 'Thursday' });
    expect(recommendationRegistry.remedy.label).toBe('Remedy');
  });
});

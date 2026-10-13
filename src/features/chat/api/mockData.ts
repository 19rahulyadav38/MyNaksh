/**
 * Initial conversation, as the backend would send it.
 *
 * This is the payload from the assignment spec, extended with `createdAt`
 * (spread across two days so date separators and grouping are visible),
 * a sender name for the human astrologer, and a few extra messages.
 * It is intentionally typed loosely (`unknown`): the API layer validates it
 * before it reaches the store, exactly as it would with a real network response.
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export function createSeedConversation(now = Date.now()): unknown[] {
  const yesterday = now - 24 * HOUR;

  return [
    {
      id: '1',
      type: 'system',
      text: 'Your session with AI Astrologer has started.',
      createdAt: yesterday,
    },
    {
      id: '2',
      type: 'user',
      text: 'Can you tell me about my career this year?',
      createdAt: yesterday + 1 * MINUTE,
    },
    {
      id: '3',
      type: 'ai',
      text: 'I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.',
      createdAt: yesterday + 2 * MINUTE,
      recommendations: [
        {
          id: '1',
          type: 'gemstone',
          title: 'Blue Sapphire',
          subtitle: 'Recommended for Saturn',
        },
        { id: '2', type: 'tarot', title: 'Career Tarot Reading' },
        { id: '3', type: 'consultation', title: 'Talk to an Astrologer' },
        { id: '4', type: 'article', title: 'Understanding Saturn Mahadasha' },
      ],
    },
    {
      id: '4',
      type: 'human',
      text: 'I also recommend focusing on your upcoming Jupiter transit.',
      senderName: 'Acharya Mehta',
      createdAt: yesterday + 5 * MINUTE,
    },
    {
      id: '5',
      type: 'system',
      text: 'Astrologer Acharya Mehta joined the conversation.',
      createdAt: now - 30 * MINUTE,
    },
    {
      id: '6',
      type: 'user',
      text: 'When does the Jupiter transit start?',
      createdAt: now - 29 * MINUTE,
    },
    {
      id: '7',
      type: 'user',
      text: 'And will it help with a job switch?',
      createdAt: now - 28 * MINUTE,
    },
    {
      id: '8',
      type: 'ai',
      text: 'Jupiter enters your 10th house next month, a favourable window for career moves. A Thursday remedy can strengthen it further.',
      createdAt: now - 27 * MINUTE,
      recommendations: [
        {
          id: '1',
          type: 'promotion',
          title: 'First consultation at ₹1/min',
          subtitle: 'Limited-time offer',
        },
        {
          id: '2',
          type: 'remedy',
          title: 'Thursday Jupiter Remedy',
          subtitle: 'Strengthens Jupiter',
          day: 'Thursday',
          durationDays: 11,
        },
        { id: '3', type: 'article', title: 'Jupiter Transit 2026 Guide' },
      ],
    },
  ];
}

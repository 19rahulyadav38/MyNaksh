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

/**
 * Earlier sessions, served page by page by `fetchOlderMessages`. Timestamps
 * sit 2–4 days before the seed so date separators appear as history loads.
 */
export function createHistory(now = Date.now()): unknown[] {
  const day = (daysAgo: number, hour: number, minute = 0) => {
    const d = new Date(now - daysAgo * 24 * HOUR);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  };

  return [
    {
      id: 'h1',
      type: 'system',
      text: 'Your session with AI Astrologer has started.',
      createdAt: day(4, 19, 0),
    },
    {
      id: 'h2',
      type: 'user',
      text: 'What does my birth chart say about this month?',
      createdAt: day(4, 19, 1),
    },
    {
      id: 'h3',
      type: 'ai',
      text: 'Mercury is direct again, so communication and paperwork should flow more easily from mid-month.',
      createdAt: day(4, 19, 2),
      recommendations: [
        {
          id: '1',
          type: 'article',
          title: 'Mercury Retrograde, Explained',
          readTimeMinutes: 4,
        },
        { id: '2', type: 'tarot', title: 'Monthly Tarot Spread', cardCount: 3 },
      ],
    },
    {
      id: 'h4',
      type: 'user',
      text: 'Any good dates for signing a lease?',
      createdAt: day(4, 19, 4),
    },
    {
      id: 'h5',
      type: 'ai',
      text: 'The 18th and 22nd look auspicious. Avoid Rahu Kaal in the afternoon.',
      createdAt: day(4, 19, 5),
    },
    {
      id: 'h6',
      type: 'system',
      text: 'Session ended.',
      createdAt: day(4, 19, 20),
    },
    {
      id: 'h7',
      type: 'system',
      text: 'Your session with AI Astrologer has started.',
      createdAt: day(3, 9, 30),
    },
    {
      id: 'h8',
      type: 'user',
      text: 'I keep feeling low on energy lately.',
      createdAt: day(3, 9, 31),
    },
    {
      id: 'h9',
      type: 'ai',
      text: 'A weak Sun in your chart can show up as low energy. Morning sunlight and a Sunday remedy can help.',
      createdAt: day(3, 9, 32),
      recommendations: [
        {
          id: '1',
          type: 'remedy',
          title: 'Surya Arghya',
          day: 'Sunday',
          durationDays: 21,
        },
        {
          id: '2',
          type: 'gemstone',
          title: 'Ruby',
          subtitle: 'Strengthens the Sun',
          planet: 'Sun',
        },
      ],
    },
    {
      id: 'h10',
      type: 'system',
      text: 'Session ended.',
      createdAt: day(3, 9, 50),
    },
    {
      id: 'h11',
      type: 'system',
      text: 'Your session with AI Astrologer has started.',
      createdAt: day(2, 21, 0),
    },
    {
      id: 'h12',
      type: 'user',
      text: 'Is this a good week to start something new?',
      createdAt: day(2, 21, 1),
    },
    {
      id: 'h13',
      type: 'ai',
      text: 'Yes. With the Moon waxing in your 1st house, new beginnings are well supported this week.',
      createdAt: day(2, 21, 2),
      recommendations: [
        {
          id: '1',
          type: 'consultation',
          title: 'Muhurat Consultation',
          astrologerName: 'Acharya Mehta',
        },
      ],
    },
    {
      id: 'h14',
      type: 'system',
      text: 'Session ended.',
      createdAt: day(2, 21, 15),
    },
  ];
}

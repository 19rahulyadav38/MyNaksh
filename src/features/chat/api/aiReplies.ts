import type { Recommendation } from '../recommendations/types';

type CannedReply = {
  keywords: string[];
  text: string;
  recommendations: Recommendation[];
};

const REPLIES: CannedReply[] = [
  {
    keywords: ['love', 'marriage', 'relationship', 'partner'],
    text: 'Venus is moving through your 7th house, which favours commitment. Patience over the next few weeks will pay off.',
    recommendations: [
      { id: '1', type: 'tarot', title: 'Love Tarot Reading', cardCount: 5 },
      {
        id: '2',
        type: 'gemstone',
        title: 'Diamond',
        subtitle: 'Recommended for Venus',
        planet: 'Venus',
        priceFrom: 24999,
      },
      {
        id: '3',
        type: 'consultation',
        title: 'Relationship Expert',
        astrologerName: 'Dr. Kavya Iyer',
        pricePerMinute: 30,
      },
    ],
  },
  {
    keywords: ['health', 'stress', 'sleep', 'energy'],
    text: 'The Moon in your 6th house points to stress building up. A simple Monday remedy and a steady routine will help.',
    recommendations: [
      {
        id: '1',
        type: 'article',
        title: 'Monday Moon Remedies',
        readTimeMinutes: 4,
      },
      {
        id: '2',
        type: 'gemstone',
        title: 'Pearl',
        subtitle: 'Calms the Moon',
        planet: 'Moon',
        priceFrom: 3499,
      },
    ],
  },
  {
    keywords: ['career', 'job', 'work', 'business', 'money'],
    text: 'Saturn rewards discipline this year. Expect steady growth after mid-year, especially in roles with responsibility.',
    recommendations: [
      { id: '1', type: 'tarot', title: 'Career Tarot Reading' },
      {
        id: '2',
        type: 'consultation',
        title: 'Career Specialist',
        astrologerName: 'Acharya Mehta',
        pricePerMinute: 25,
      },
      {
        id: '3',
        type: 'promotion',
        title: '50% off your first report',
        discountLabel: 'SAVE50',
      },
    ],
  },
];

const FALLBACK: CannedReply = {
  keywords: [],
  text: 'Your chart shows a supportive Jupiter period ahead. Tell me more about what is on your mind and I can be more specific.',
  recommendations: [
    {
      id: '1',
      type: 'article',
      title: 'What Jupiter Transits Mean',
      readTimeMinutes: 6,
    },
  ],
};

export function pickAiReply(prompt: string): Omit<CannedReply, 'keywords'> {
  const normalized = prompt.toLowerCase();
  const reply =
    REPLIES.find(candidate =>
      candidate.keywords.some(keyword => normalized.includes(keyword)),
    ) ?? FALLBACK;
  return { text: reply.text, recommendations: reply.recommendations };
}

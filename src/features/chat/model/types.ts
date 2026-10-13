import type { Recommendation } from '../recommendations/types';

export type MessageType = 'user' | 'ai' | 'human' | 'system';

export type SendStatus = 'sending' | 'sent' | 'failed';

export type FeedbackValue = 'like' | 'dislike';

export const FEEDBACK_REASONS = [
  'Inaccurate',
  'Too Generic',
  "Didn't Help",
  'Too Long',
] as const;

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

export type Feedback = {
  value: FeedbackValue | null;
  reasons: FeedbackReason[];
};

export type ReplyReference = {
  id: string;
  type: MessageType;
  preview: string;
};

type BaseMessage = {
  id: string;
  text: string;
  createdAt: number;
};

export type UserMessage = BaseMessage & {
  type: 'user';
  /** Client-generated id used for optimistic sends, idempotent retries and dedup. */
  clientId?: string;
  status: SendStatus;
  replyTo?: ReplyReference;
};

export type AiMessage = BaseMessage & {
  type: 'ai';
  recommendations?: Recommendation[];
  feedback?: Feedback;
};

export type HumanMessage = BaseMessage & {
  type: 'human';
  senderName?: string;
  replyTo?: ReplyReference;
};

export type SystemMessage = BaseMessage & {
  type: 'system';
};

export type Message = UserMessage | AiMessage | HumanMessage | SystemMessage;

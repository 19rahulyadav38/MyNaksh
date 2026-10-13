import type { Message } from '../../model/types';

export type MessageComponentProps<M extends Message> = {
  message: M;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

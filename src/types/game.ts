
export type GameMode = 'practice' | 'test';

export interface GameError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface GameProgress {
  cardsCompleted: number;
  totalCards: number;
  percentageComplete: number;
  currentCycle: number;
}

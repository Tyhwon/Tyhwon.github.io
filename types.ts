
export type NewsType = 'FACT' | 'HOAX';

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  url: string;
  content: string;
  type: NewsType;
  imageUrl: string;
  explanation: string;
  indicators: string[]; // Reasons why it's a hoax or a fact
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  EDUCATION = 'EDUCATION',
  RANK_UP = 'RANK_UP',
  GAME_OVER = 'GAME_OVER',
  SHUTDOWN = 'SHUTDOWN'
}

export enum Rank {
  NOVICE = 'Novice Scout',
  JUNIOR = 'Junior Fact-Checker',
  SENIOR = 'Senior Investigator',
  EXPERT = 'Truth Specialist',
  MASTER = 'Master Verificator'
}

export interface PlayerStats {
  score: number;
  battery: number; // Lives (0-100)
  calmIndex: number; // (0-100)
  correctStreak: number;
  rank: Rank;
}

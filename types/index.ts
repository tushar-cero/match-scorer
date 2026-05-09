export interface ScoreControl {
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  color: string;
  type: "add" | "subtract";
  category?: string;
  icon?: string;
}

export interface SportConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  scoring: {
    type: "points" | "frames" | "sets-and-points";
    sets?: {
      defaultCount: number;
      options: number[];
      pointsPerSet: number;
      pointsPerSetOptions: number[];
      winByMargin: number;
      minPointsToWin: number;
      deuceRules?: { activatesAt: number; winByMargin: number; cap?: number };
    };
    frames?: {
      defaultBestOf: number;
      options: number[];
      foulMinPenalty: number;
    };
  };
  liveScoring: { controls: ScoreControl[] };
  validation: { minPlayers: number; maxPlayers?: number; teamSize: 1 | 2 };
}

export interface Player {
  id: string;
  name: string;
  seed?: number;
}

export interface MatchConfig {
  sportId: string;
  sets?: number;
  pointsPerSet?: number;
  bestOfFrames?: number;
}

type MatchStatus = "upcoming" | "in-progress" | "completed";
export interface SetScore {
  setNumber: number;
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  status: MatchStatus;
}

export interface ScoringAction {
  id: string;
  timestamp: Date;
  playerId: string;
  setNumber: number;
  actionType: string;
  pointsAwarded: number;
  targetPlayerId: string;
  metadata?: Record<string, unknown>;
}

export interface Match {
  id: string;
  tournamentId?: string;
  sportId: string;
  round?: number;
  matchNumber?: number;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  config: MatchConfig;
  status: "upcoming" | "in-progress" | "completed";
  scoringMode?: "final" | "live";
  sets: SetScore[];
  liveActions: ScoringAction[];
  winnerId?: string;
  winnerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BracketRound {
  round: number;
  matches: string[];
}

export interface Tournament {
  id: string;
  name: string;
  sportId: string;
  format: "single-elimination" | "round-robin" | "double-elimination";
  matchConfig: MatchConfig;
  players: Player[];
  bracket: BracketRound[];
  status: "upcoming" | "in-progress" | "completed";
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

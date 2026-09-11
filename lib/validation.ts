/**
 * Input validation utilities for Match Scorer
 */

export const VALIDATION = {
  PLAYER_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-']+$/,
  },
  TOURNAMENT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-']+$/,
  },
  SCORE: {
    MIN: 0,
    MAX: 999,
  },
};

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePlayerName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'playerName', message: 'Player name is required' };
  }

  if (name.length < VALIDATION.PLAYER_NAME.MIN_LENGTH) {
    return {
      field: 'playerName',
      message: `Player name must be at least ${VALIDATION.PLAYER_NAME.MIN_LENGTH} character`,
    };
  }

  if (name.length > VALIDATION.PLAYER_NAME.MAX_LENGTH) {
    return {
      field: 'playerName',
      message: `Player name must be no more than ${VALIDATION.PLAYER_NAME.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.PLAYER_NAME.PATTERN.test(name)) {
    return {
      field: 'playerName',
      message: 'Player name can only contain letters, numbers, spaces, hyphens, and apostrophes',
    };
  }

  return null;
}

export function validateTournamentName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'tournamentName', message: 'Tournament name is required' };
  }

  if (name.length < VALIDATION.TOURNAMENT_NAME.MIN_LENGTH) {
    return {
      field: 'tournamentName',
      message: `Tournament name must be at least ${VALIDATION.TOURNAMENT_NAME.MIN_LENGTH} character`,
    };
  }

  if (name.length > VALIDATION.TOURNAMENT_NAME.MAX_LENGTH) {
    return {
      field: 'tournamentName',
      message: `Tournament name must be no more than ${VALIDATION.TOURNAMENT_NAME.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.TOURNAMENT_NAME.PATTERN.test(name)) {
    return {
      field: 'tournamentName',
      message: 'Tournament name can only contain letters, numbers, spaces, hyphens, and apostrophes',
    };
  }

  return null;
}

export function validateScore(score: number | string): ValidationError | null {
  const scoreNum = typeof score === 'string' ? parseInt(score, 10) : score;

  if (isNaN(scoreNum)) {
    return { field: 'score', message: 'Score must be a valid number' };
  }

  if (scoreNum < VALIDATION.SCORE.MIN) {
    return {
      field: 'score',
      message: `Score must be at least ${VALIDATION.SCORE.MIN}`,
    };
  }

  if (scoreNum > VALIDATION.SCORE.MAX) {
    return {
      field: 'score',
      message: `Score must be no more than ${VALIDATION.SCORE.MAX}`,
    };
  }

  return null;
}

export function validateAllScores(scores: number[]): ValidationError | null {
  for (const score of scores) {
    const error = validateScore(score);
    if (error) return error;
  }
  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .substring(0, VALIDATION.PLAYER_NAME.MAX_LENGTH);
}

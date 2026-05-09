import { Match, ScoringAction } from "@/types";
import { nanoid } from "./utils";
export { initializeSets } from "./bracket";
import { initializeSets } from "./bracket";
import { getSportById } from "@/config/sports";

export function checkSetWinner(
  p1: number,
  p2: number,
  pointsToWin: number,
  winByMargin: number,
  deuceAt: number,
): "player1" | "player2" | null {
  const atDeuce = p1 >= deuceAt || p2 >= deuceAt;
  if (atDeuce) {
    if (
      Math.abs(p1 - p2) >= winByMargin &&
      (p1 > p2 ? p1 >= deuceAt : p2 >= deuceAt)
    )
      return p1 > p2 ? "player1" : "player2";
    return null;
  }
  if (p1 >= pointsToWin && p1 - p2 >= winByMargin) return "player1";
  if (p2 >= pointsToWin && p2 - p1 >= winByMargin) return "player2";
  return null;
}

type MatchState = Pick<Match, "sets" | "winnerId" | "winnerName" | "status">;

function advanceToNextSet(sets: Match["sets"]): Match["sets"] {
  const nextSetIdx = sets.findIndex((s) => s.status === "upcoming");
  if (nextSetIdx < 0) return sets;
  return sets.map((s, i) =>
    i === nextSetIdx ? { ...s, status: "in-progress" as const } : s,
  );
}

function resolveMatchWinner(
  match: Match,
  sets: Match["sets"],
  winsNeeded: number,
): Partial<MatchState> {
  const p1Wins = sets.filter((s) => s.winnerId === match.player1Id).length;
  const p2Wins = sets.filter((s) => s.winnerId === match.player2Id).length;
  if (p1Wins >= winsNeeded) {
    return {
      sets,
      winnerId: match.player1Id,
      winnerName: match.player1Name,
      status: "completed",
    };
  }
  if (p2Wins >= winsNeeded) {
    return {
      sets,
      winnerId: match.player2Id,
      winnerName: match.player2Name,
      status: "completed",
    };
  }
  return { sets: advanceToNextSet(sets) };
}

function applySetsAndPoints(
  match: Match,
  currentSet: Match["sets"][number],
  setIdx: number,
): MatchState {
  const sport = getSportById(match.sportId);
  const scoring = sport?.scoring.sets!;
  const pps = match.config.pointsPerSet ?? scoring.pointsPerSet;
  const deuceAt = pps === 11 ? 10 : 20;
  const result = checkSetWinner(
    currentSet.player1Score,
    currentSet.player2Score,
    pps,
    scoring.winByMargin,
    deuceAt,
  );

  if (!result) {
    currentSet.status = "in-progress";
    return {
      sets: match.sets.map((s, i) => (i === setIdx ? currentSet : s)),
      winnerId: match.winnerId,
      winnerName: match.winnerName,
      status: match.status,
    };
  }

  currentSet.winnerId =
    result === "player1" ? match.player1Id : match.player2Id;
  currentSet.status = "completed";
  const newSets = match.sets.map((s, i) => (i === setIdx ? currentSet : s));
  const setsToWin = Math.ceil((match.config.sets ?? 3) / 2);
  const resolved = resolveMatchWinner(match, newSets, setsToWin);
  return {
    sets: resolved.sets ?? newSets,
    winnerId: resolved.winnerId ?? match.winnerId,
    winnerName: resolved.winnerName ?? match.winnerName,
    status: resolved.status ?? match.status,
  };
}

function applyFrames(
  match: Match,
  currentSet: Match["sets"][number],
  setIdx: number,
  actionType: string,
): MatchState {
  if (actionType !== "end-frame") {
    currentSet.status = "in-progress";
    return {
      sets: match.sets.map((s, i) => (i === setIdx ? currentSet : s)),
      winnerId: match.winnerId,
      winnerName: match.winnerName,
      status: match.status,
    };
  }

  if (currentSet.player1Score > currentSet.player2Score) {
    currentSet.winnerId = match.player1Id;
  } else if (currentSet.player2Score > currentSet.player1Score) {
    currentSet.winnerId = match.player2Id;
  }
  currentSet.status = "completed";
  const newSets = match.sets.map((s, i) => (i === setIdx ? currentSet : s));
  const framesToWin = Math.ceil((match.config.bestOfFrames ?? 5) / 2);
  const resolved = resolveMatchWinner(match, newSets, framesToWin);
  return {
    sets: resolved.sets ?? newSets,
    winnerId: resolved.winnerId ?? match.winnerId,
    winnerName: resolved.winnerName ?? match.winnerName,
    status: resolved.status ?? match.status,
  };
}

export function applyLiveAction(
  match: Match,
  playerId: string,
  actionType: string,
  pointsAwarded: number,
  targetPlayerId: string,
  metadata?: Record<string, unknown>,
): Match {
  const sport = getSportById(match.sportId);
  const currentSetIdx = match.sets.findIndex((s) => s.status === "in-progress");
  const setIdx = Math.max(currentSetIdx, 0);
  const currentSet = { ...match.sets[setIdx] };

  const action: ScoringAction = {
    id: nanoid(),
    timestamp: new Date(),
    playerId,
    setNumber: currentSet.setNumber,
    actionType,
    pointsAwarded,
    targetPlayerId,
    metadata,
  };

  // Apply points
  if (targetPlayerId === match.player1Id) {
    currentSet.player1Score += pointsAwarded;
  } else {
    currentSet.player2Score += pointsAwarded;
  }

  let state: MatchState = {
    sets: match.sets.map((s, i) => (i === setIdx ? currentSet : s)),
    winnerId: match.winnerId,
    winnerName: match.winnerName,
    status: match.status,
  };

  if (sport?.scoring.type === "sets-and-points" && sport.scoring.sets) {
    state = applySetsAndPoints(match, currentSet, setIdx);
  } else if (sport?.scoring.type === "frames") {
    state = applyFrames(match, currentSet, setIdx, actionType);
  }

  return {
    ...match,
    ...state,
    liveActions: [...match.liveActions, action],
    updatedAt: new Date(),
  };
}

export function undoLastAction(match: Match): Match {
  if (match.liveActions.length === 0) return match;
  const actions = match.liveActions.slice(0, -1);
  // Rebuild sets from scratch
  let rebuilt: Match = {
    ...match,
    sets: initializeSets(match),
    liveActions: [] as import("@/types").ScoringAction[],
    winnerId: undefined,
    winnerName: undefined,
    status: "in-progress" as const,
  };
  for (const a of actions) {
    rebuilt = applyLiveAction(
      rebuilt,
      a.playerId,
      a.actionType,
      a.pointsAwarded,
      a.targetPlayerId,
      a.metadata,
    );
  }
  return { ...rebuilt, liveActions: actions };
}

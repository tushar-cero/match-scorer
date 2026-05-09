import { Player, Match, BracketRound, MatchConfig } from "@/types";
import { nanoid } from "./utils";

function seedPlayers(players: Player[]): { seeded: Player[]; size: number } {
  const n = players.length;
  let size = 1;
  while (size < n) size *= 2;
  const seeded = [...players];
  for (let i = 0; i < size - n; i++) {
    seeded.push({ id: `bye-${i}`, name: "BYE", seed: n + i + 1 });
  }
  return { seeded, size };
}

function createByeMatch(
  p1: Player,
  p2: Player,
  i: number,
  sportId: string,
  matchConfig: MatchConfig,
  tournamentId: string,
  now: Date,
): Match {
  const isBye = p1.name === "BYE" || p2.name === "BYE";
  let byeWinnerId: string | undefined;
  let byeWinnerName: string | undefined;
  if (isBye) {
    byeWinnerId = p1.name === "BYE" ? p2.id : p1.id;
    byeWinnerName = p1.name === "BYE" ? p2.name : p1.name;
  }
  const m: Match = {
    id: nanoid(),
    tournamentId,
    sportId,
    round: 1,
    matchNumber: i + 1,
    player1Id: p1.id,
    player2Id: p2.id,
    player1Name: p1.name,
    player2Name: p2.name,
    config: matchConfig,
    status: isBye ? "completed" : "upcoming",
    sets: [],
    liveActions: [],
    winnerId: byeWinnerId,
    winnerName: byeWinnerName,
    createdAt: now,
    updatedAt: now,
  };
  m.sets = initializeSets(m);
  return m;
}

function createRound1Matches(
  seeded: Player[],
  size: number,
  sportId: string,
  matchConfig: MatchConfig,
  tournamentId: string,
  now: Date,
): Match[] {
  return Array.from({ length: size / 2 }, (_, i) =>
    createByeMatch(
      seeded[i * 2],
      seeded[i * 2 + 1],
      i,
      sportId,
      matchConfig,
      tournamentId,
      now,
    ),
  );
}

function createNextRoundMatch(
  roundNum: number,
  i: number,
  sportId: string,
  matchConfig: MatchConfig,
  tournamentId: string,
  now: Date,
): Match {
  const m: Match = {
    id: nanoid(),
    tournamentId,
    sportId,
    round: roundNum,
    matchNumber: i + 1,
    player1Id: `tbd-${roundNum}-${i * 2}`,
    player2Id: `tbd-${roundNum}-${i * 2 + 1}`,
    player1Name: "TBD",
    player2Name: "TBD",
    config: matchConfig,
    status: "upcoming",
    sets: [],
    liveActions: [],
    createdAt: now,
    updatedAt: now,
  };
  m.sets = initializeSets(m);
  return m;
}

function autoAdvanceByes(prevRound: Match[], roundMatches: Match[]): void {
  for (let i = 0; i < prevRound.length; i++) {
    const pm = prevRound[i];
    if (pm.status !== "completed" || !pm.winnerId) continue;
    const nextIdx = Math.floor(i / 2);
    if (i % 2 === 0) {
      roundMatches[nextIdx].player1Id = pm.winnerId!;
      roundMatches[nextIdx].player1Name = pm.winnerName!;
    } else {
      roundMatches[nextIdx].player2Id = pm.winnerId!;
      roundMatches[nextIdx].player2Name = pm.winnerName!;
    }
  }
}

export function generateBracket(
  players: Player[],
  sportId: string,
  matchConfig: MatchConfig,
  tournamentId: string,
): { matches: Match[]; bracket: BracketRound[] } {
  const { seeded, size } = seedPlayers(players);
  const now = new Date();
  const allMatches: Match[] = [];
  const bracket: BracketRound[] = [];

  const r1Matches = createRound1Matches(
    seeded,
    size,
    sportId,
    matchConfig,
    tournamentId,
    now,
  );
  allMatches.push(...r1Matches);
  bracket.push({ round: 1, matches: r1Matches.map((m) => m.id) });

  let prevRound = r1Matches;
  let roundNum = 2;
  while (prevRound.length > 1) {
    const roundMatches = Array.from({ length: prevRound.length / 2 }, (_, i) =>
      createNextRoundMatch(
        roundNum,
        i,
        sportId,
        matchConfig,
        tournamentId,
        now,
      ),
    );
    autoAdvanceByes(prevRound, roundMatches);
    allMatches.push(...roundMatches);
    bracket.push({ round: roundNum, matches: roundMatches.map((m) => m.id) });
    prevRound = roundMatches;
    roundNum++;
  }

  return { matches: allMatches, bracket };
}

export function advanceWinner(
  matches: Match[],
  bracket: BracketRound[],
  completedMatch: Match,
): Match[] {
  const updated = [...matches];
  const round = completedMatch.round!;
  const matchIdx = bracket[round - 1]?.matches.indexOf(completedMatch.id);
  if (matchIdx === -1 || matchIdx === undefined) return updated;

  const nextRound = bracket[round]; // 0-indexed, so bracket[round] = round+1
  if (!nextRound) return updated;

  const nextMatchIdx = Math.floor(matchIdx / 2);
  const slot = matchIdx % 2 === 0 ? "player1" : "player2";
  const nextMatchId = nextRound.matches[nextMatchIdx];
  const nextMatch = updated.find((m) => m.id === nextMatchId);
  if (!nextMatch) return updated;

  const updatedNext: Match = {
    ...nextMatch,
    [`${slot}Id`]: completedMatch.winnerId!,
    [`${slot}Name`]: completedMatch.winnerName!,
    updatedAt: new Date(),
  };
  return updated.map((m) => (m.id === nextMatchId ? updatedNext : m));
}

export function initializeSets(match: Match): import("@/types").SetScore[] {
  const sport = match.config;
  const total = sport.sets ?? sport.bestOfFrames ?? 5;
  return Array.from({ length: total }, (_, i) => ({
    setNumber: i + 1,
    player1Score: 0,
    player2Score: 0,
    status: i === 0 ? ("in-progress" as const) : ("upcoming" as const),
  }));
}

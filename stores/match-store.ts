"use client";

import { create } from "zustand";
import { Match } from "@/types";
import { db } from "@/lib/db";
import { applyLiveAction, undoLastAction, initializeSets } from "@/lib/scoring";
import { nanoid } from "@/lib/utils";

interface MatchStore {
  currentMatch: Match | null;
  recentMatches: Match[];
  loading: boolean;
  error: string | null;
  loadMatch: (id: string) => Promise<void>;
  loadRecentMatches: () => Promise<void>;
  createMatch: (
    match: Omit<
      Match,
      "id" | "createdAt" | "updatedAt" | "sets" | "liveActions"
    >,
  ) => Promise<Match>;
  saveMatch: (match: Match) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  addLiveAction: (
    playerId: string,
    actionType: string,
    pointsAwarded: number,
    targetPlayerId: string,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
  undoAction: () => Promise<void>;
  setScoringMode: (mode: "final" | "live") => Promise<void>;
  updateFinalScore: (sets: Match["sets"]) => Promise<void>;
  endSnookerFrame: () => Promise<void>;
  clearError: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  currentMatch: null,
  recentMatches: [],
  loading: false,
  error: null,

  loadMatch: async (id) => {
    set({ loading: true, error: null });
    try {
      const match = await db.matches.get(id);
      if (match) {
        set({ currentMatch: match, loading: false });
      } else {
        set({ error: 'Match not found', loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to load match', loading: false });
      console.error('Error loading match:', err);
    }
  },

  loadRecentMatches: async () => {
    set({ loading: true, error: null });
    try {
      const all = await db.matches.orderBy("createdAt").reverse().toArray();
      set({ recentMatches: all.filter((m) => !m.tournamentId).slice(0, 20), loading: false });
    } catch (err) {
      set({ error: 'Failed to load matches', loading: false });
      console.error('Error loading recent matches:', err);
    }
  },

  createMatch: async (matchData) => {
    const match: Match = {
      ...matchData,
      id: nanoid(),
      sets: [],
      liveActions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    match.sets = initializeSets(match);
    await db.matches.add(match);
    set({ currentMatch: match });
    return match;
  },

  saveMatch: async (match) => {
    await db.matches.put(match);
    set({ currentMatch: match });
  },

  deleteMatch: async (id) => {
    await db.matches.delete(id);
    set({ recentMatches: get().recentMatches.filter((m) => m.id !== id) });
  },

  addLiveAction: async (
    playerId,
    actionType,
    pointsAwarded,
    targetPlayerId,
    metadata,
  ) => {
    const { currentMatch } = get();
    if (!currentMatch) return;
    const updated = applyLiveAction(
      currentMatch,
      playerId,
      actionType,
      pointsAwarded,
      targetPlayerId,
      metadata,
    );
    await db.matches.put(updated);
    set({ currentMatch: updated });
  },

  undoAction: async () => {
    const { currentMatch } = get();
    if (!currentMatch) return;
    const updated = undoLastAction(currentMatch);
    await db.matches.put(updated);
    set({ currentMatch: updated });
  },

  setScoringMode: async (mode) => {
    const { currentMatch } = get();
    if (!currentMatch) return;
    const updated: Match = {
      ...currentMatch,
      scoringMode: mode,
      status: "in-progress",
      updatedAt: new Date(),
    };
    await db.matches.put(updated);
    set({ currentMatch: updated });
  },

  updateFinalScore: async (sets) => {
    const { currentMatch } = get();
    if (!currentMatch) return;
    const { getSportById } = await import("@/config/sports");
    const sport = getSportById(currentMatch.sportId);
    let p1Wins = 0,
      p2Wins = 0;
    for (const s of sets) {
      if (s.winnerId === currentMatch.player1Id) p1Wins++;
      else if (s.winnerId === currentMatch.player2Id) p2Wins++;
    }
    const threshold =
      sport?.scoring.type === "sets-and-points"
        ? Math.ceil((currentMatch.config.sets ?? 3) / 2)
        : Math.ceil((currentMatch.config.bestOfFrames ?? 5) / 2);
    let winnerId: string | undefined;
    if (p1Wins >= threshold) {
      winnerId = currentMatch.player1Id;
    } else if (p2Wins >= threshold) {
      winnerId = currentMatch.player2Id;
    }
    let winnerName: string | undefined;
    if (winnerId === currentMatch.player1Id) {
      winnerName = currentMatch.player1Name;
    } else if (winnerId === currentMatch.player2Id) {
      winnerName = currentMatch.player2Name;
    }
    const updated: Match = {
      ...currentMatch,
      sets,
      status: winnerId ? "completed" : "in-progress",
      winnerId,
      winnerName,
      updatedAt: new Date(),
    };
    await db.matches.put(updated);
    set({ currentMatch: updated });
  },

  endSnookerFrame: async () => {
    const { currentMatch } = get();
    if (!currentMatch) return;
    const updated = applyLiveAction(
      currentMatch,
      currentMatch.player1Id,
      "end-frame",
      0,
      currentMatch.player1Id,
    );
    await db.matches.put(updated);
    set({ currentMatch: updated });
  },

  clearError: () => {
    set({ error: null });
  },
}));

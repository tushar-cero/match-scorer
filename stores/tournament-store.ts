"use client";

import { create } from "zustand";
import { Tournament, Match, Player, MatchConfig } from "@/types";
import { db } from "@/lib/db";
import { generateBracket, advanceWinner } from "@/lib/bracket";
import { nanoid } from "@/lib/utils";

interface TournamentStore {
  currentTournament: Tournament | null;
  tournaments: Tournament[];
  tournamentMatches: Match[];
  loadTournaments: () => Promise<void>;
  loadTournament: (id: string) => Promise<void>;
  createTournament: (data: {
    name: string;
    sportId: string;
    players: Player[];
    matchConfig: MatchConfig;
    format: Tournament["format"];
  }) => Promise<Tournament>;
  deleteTournament: (id: string) => Promise<void>;
  completeMatch: (matchId: string, winnerId: string, winnerName: string) => Promise<void>;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  currentTournament: null,
  tournaments: [],
  tournamentMatches: [],

  loadTournaments: async () => {
    const all = await db.tournaments.orderBy("createdAt").reverse().toArray();
    set({ tournaments: all });
  },

  loadTournament: async (id) => {
    const tournament = await db.tournaments.get(id);
    if (!tournament) return;
    const matches = await db.matches.where("tournamentId").equals(id).toArray();
    set({ currentTournament: tournament, tournamentMatches: matches });
  },

  createTournament: async ({ name, sportId, players, matchConfig, format }) => {
    const id = nanoid();
    const { matches, bracket } = generateBracket(players, sportId, matchConfig, id);
    const tournament: Tournament = {
      id, name, sportId, format, matchConfig, players, bracket,
      status: "upcoming", createdAt: new Date(), updatedAt: new Date(),
    };
    await db.tournaments.add(tournament);
    await db.matches.bulkAdd(matches);
    set({ currentTournament: tournament, tournamentMatches: matches });
    return tournament;
  },

  deleteTournament: async (id) => {
    await db.tournaments.delete(id);
    await db.matches.where("tournamentId").equals(id).delete();
    set({ tournaments: get().tournaments.filter((t) => t.id !== id) });
  },

  completeMatch: async (matchId, winnerId, winnerName) => {
    const { currentTournament, tournamentMatches } = get();
    if (!currentTournament) return;
    const match = tournamentMatches.find((m) => m.id === matchId);
    if (!match) return;

    const updatedMatch: Match = { ...match, status: "completed", winnerId, winnerName, updatedAt: new Date() };
    const advanced = advanceWinner(tournamentMatches.map((m) => m.id === matchId ? updatedMatch : m), currentTournament.bracket, updatedMatch);

    await db.matches.put(updatedMatch);
    for (const m of advanced) {
      if (m.id !== matchId) {
        const old = tournamentMatches.find((tm) => tm.id === m.id);
        if (old && (old.player1Id !== m.player1Id || old.player2Id !== m.player2Id)) {
          await db.matches.put(m);
        }
      }
    }

    const totalRounds = currentTournament.bracket.length;
    const finalRound = currentTournament.bracket[totalRounds - 1];
    const isFinal = finalRound?.matches.includes(matchId);
    const updatedTournament: Tournament = {
      ...currentTournament,
      status: isFinal ? "completed" : "in-progress",
      winner: isFinal ? winnerName : currentTournament.winner,
      updatedAt: new Date(),
    };
    await db.tournaments.put(updatedTournament);
    set({ currentTournament: updatedTournament, tournamentMatches: advanced });
  },
}));

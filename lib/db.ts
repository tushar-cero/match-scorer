import Dexie, { Table } from "dexie";
import { Tournament, Match } from "@/types";

class AppDB extends Dexie {
  tournaments!: Table<Tournament, string>;
  matches!: Table<Match, string>;

  constructor() {
    super("MatchScorerDB");
    this.version(1).stores({
      tournaments: "id, status, createdAt",
      matches: "id, tournamentId, status, createdAt",
    });
  }
}

export const db = new AppDB();

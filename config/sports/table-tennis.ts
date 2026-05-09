import { SportConfig } from "@/types";

export const tableTennisConfig: SportConfig = {
  id: "tt",
  name: "Table Tennis",
  icon: "🏓",
  color: "text-green-600",
  scoring: {
    type: "sets-and-points",
    sets: {
      defaultCount: 5,
      options: [1, 3, 5, 7, 9, 11],
      pointsPerSet: 11,
      pointsPerSetOptions: [11, 21],
      winByMargin: 2,
      minPointsToWin: 11,
      deuceRules: { activatesAt: 10, winByMargin: 2 },
    },
  },
  liveScoring: {
    controls: [
      { id: "add1", label: "+1", shortLabel: "+1", value: 1, color: "bg-ink", type: "add" },
      { id: "sub1", label: "-1", shortLabel: "-1", value: 1, color: "bg-gray-200", type: "subtract" },
    ],
  },
  validation: { minPlayers: 2, teamSize: 1 },
};

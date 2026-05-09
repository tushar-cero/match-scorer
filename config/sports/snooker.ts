import { SportConfig } from "@/types";

export const snookerConfig: SportConfig = {
  id: "sn",
  name: "Snooker",
  icon: "🎱",
  color: "text-amber-800",
  scoring: {
    type: "frames",
    frames: {
      defaultBestOf: 5,
      options: [3, 5, 7, 9, 11, 17, 19, 35],
      foulMinPenalty: 4,
    },
  },
  liveScoring: {
    controls: [
      { id: "red",    label: "Red",    shortLabel: "R", value: 1, color: "#c1452b", type: "add", category: "balls" },
      { id: "yellow", label: "Yellow", shortLabel: "Y", value: 2, color: "#e6b517", type: "add", category: "balls" },
      { id: "green",  label: "Green",  shortLabel: "G", value: 3, color: "#2f7d32", type: "add", category: "balls" },
      { id: "brown",  label: "Brown",  shortLabel: "Br",value: 4, color: "#5e3a1a", type: "add", category: "balls" },
      { id: "blue",   label: "Blue",   shortLabel: "B", value: 5, color: "#1a4f8a", type: "add", category: "balls" },
      { id: "pink",   label: "Pink",   shortLabel: "P", value: 6, color: "#d96b9a", type: "add", category: "balls" },
      { id: "black",  label: "Black",  shortLabel: "Bl",value: 7, color: "#0a0a0a", type: "add", category: "balls" },
    ],
  },
  validation: { minPlayers: 2, teamSize: 1 },
};

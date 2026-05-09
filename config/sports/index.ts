import { tableTennisConfig } from "./table-tennis";
import { snookerConfig } from "./snooker";
import { SportConfig } from "@/types";

export const SPORTS: SportConfig[] = [tableTennisConfig, snookerConfig];

export function getSportById(id: string): SportConfig | undefined {
  return SPORTS.find((s) => s.id === id);
}

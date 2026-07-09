/**
 * Future Supabase schema notes only.
 *
 * This file intentionally does not import Supabase, create a client, read
 * environment variables, authenticate users, or upload files.
 */

export const FUTURE_SUPABASE_TABLES = {
  organizations: "organizations",
  profiles: "profiles",
  players: "players",
  matchSessions: "match_sessions",
  clips: "clips",
  elitePressurePoints: "elite_pressure_points",
  analysisDrafts: "analysis_drafts",
  reports: "reports",
} as const;

export const TYPE_TO_TABLE_MAP = {
  ElitePressurePoint: FUTURE_SUPABASE_TABLES.elitePressurePoints,
  ClipContext: FUTURE_SUPABASE_TABLES.clips,
  AIDraftAnalysis: FUTURE_SUPABASE_TABLES.analysisDrafts,
  PlayerReport: FUTURE_SUPABASE_TABLES.reports,
  Player: FUTURE_SUPABASE_TABLES.players,
  MatchSession: FUTURE_SUPABASE_TABLES.matchSessions,
} as const;

export const FIRST_SUPABASE_TABLE_TO_IMPLEMENT =
  FUTURE_SUPABASE_TABLES.elitePressurePoints;


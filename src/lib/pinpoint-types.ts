/**
 * Core Pinpoint MVP contracts. These types are the shared boundary for future
 * Supabase tables, CSV dataset imports, AI analysis API responses, and report
 * generation.
 */

export const PRESSURE_TRIGGERS = [
  "30-30",
  "Deuce",
  "Advantage",
  "Break Point",
  "Set Point",
  "Match Point",
  "Tiebreak",
] as const;

export const CONFIDENCE_LEVELS = ["Low", "Medium", "High"] as const;

export const REVIEW_STATUSES = [
  "Draft",
  "In Review",
  "Needs Review",
  "Approved",
  "Rejected",
] as const;

export const SURFACES = ["Hard", "Clay", "Grass", "Indoor Hard"] as const;

export const SERVE_OR_RETURN_OPTIONS = ["Serve", "Return", "Unknown"] as const;

export const PLAYER_POINT_OUTCOMES = ["Won", "Lost", "Unknown"] as const;

export const AGGRESSION_LEVELS = ["Controlled", "Balanced", "High"] as const;

export const RISK_DECISIONS = [
  "Conservative",
  "Calculated",
  "Aggressive",
] as const;

export type PressureTrigger = (typeof PRESSURE_TRIGGERS)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type Surface = (typeof SURFACES)[number];
export type ServeOrReturn = (typeof SERVE_OR_RETURN_OPTIONS)[number];
export type PlayerPointOutcome = (typeof PLAYER_POINT_OUTCOMES)[number];
export type AggressionLevel = (typeof AGGRESSION_LEVELS)[number];
export type RiskDecision = (typeof RISK_DECISIONS)[number];

export interface ClipContext {
  id: string;
  playerName: string;
  matchSession: string;
  clipSource: string;
  timestampOrRange: string;
  scoreContext: string;
  pressureTrigger: PressureTrigger;
  playerPointOutcome?: PlayerPointOutcome;
  coachNote: string;
  createdAt: string;
}

export interface AIDraftAnalysis {
  id: string;
  clipContextId: string;
  serveOrReturn: ServeOrReturn;
  pointOutcome: string;
  playerPointOutcome?: PlayerPointOutcome;
  firstServeIn: boolean | null;
  rallyLengthEstimate: number | null;
  primaryPattern: string;
  pressurePatternFamily?: string;
  likelyBreakdownMoment?: string;
  decisionQuality?: string;
  executionQuality?: string;
  missedOpportunity?: string;
  eliteReferencePattern?: string;
  aggressionLevel: AggressionLevel;
  riskDecision: RiskDecision;
  shotThatDecidedPoint: string;
  errorOrWinnerType: string;
  resetBehavior: string;
  bodyLanguageNote: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string[];
  confidenceLevel: ConfidenceLevel;
  eliteComparison: string;
  nextTimeAdjustment?: string;
  trainingFocus?: string;
  analysisNotes: string;
  reviewStatus: ReviewStatus;
}

export interface ElitePressurePoint {
  id: string;
  elitePlayer: string;
  opponent: string;
  matchTournament: string;
  year: number;
  surface: Surface;
  setScore: string;
  gameScore: string;
  pointScore: string;
  pressureTrigger: PressureTrigger;
  timestamp: string;
  sourceLink: string;
  clipFileName: string;
  playerToAnalyze: string;
  serverIfKnown: string;
  uploaderNote: string;
  serveOrReturn: ServeOrReturn;
  pointOutcome: string;
  firstServeIn: boolean | null;
  rallyLength: number | null;
  primaryPattern: string;
  aggressionLevel: AggressionLevel;
  riskDecision: RiskDecision;
  shotThatDecidedPoint: string;
  errorOrWinnerType: string;
  resetBehavior: string;
  bodyLanguageNote: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string[];
  confidenceLevel: ConfidenceLevel;
  aiNotes: string;
  reviewStatus: ReviewStatus;
  reviewerCorrection: string;
  approvedForLibrary: boolean;
  pointPatternFamily: string;
  patternHierarchy: string;
}

export interface PlayerReport {
  id: string;
  playerName: string;
  matchSession: string;
  analyzedClipIds: string[];
  dominantPressurePatterns: string[];
  recurringRisks: string[];
  eliteComparisons: string[];
  coachingPriorities: string[];
  createdAt: string;
}

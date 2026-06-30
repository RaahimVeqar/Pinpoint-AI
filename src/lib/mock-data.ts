import type {
  ElitePressurePoint,
  PressureTrigger,
} from "@/lib/pinpoint-types";

export type { PressureTrigger } from "@/lib/pinpoint-types";

export type Player = {
  id: string;
  name: string;
  age: number;
  handedness: "Right" | "Left";
  level: string;
  playingStyle: string;
  coach: string;
  pressureWinRate: number;
  primaryFocus: string;
};

export type MatchSession = {
  id: string;
  playerId: string;
  opponent: string;
  event: string;
  date: string;
  surface: "Hard" | "Clay" | "Grass" | "Indoor Hard";
  score: string;
  pressurePointsTagged: number;
  status: "Ready for tagging" | "Tagged" | "Report drafted";
};

export type PressurePoint = {
  id: string;
  matchSessionId: string;
  playerId: string;
  timestamp: string;
  trigger: PressureTrigger;
  scoreContext: string;
  server: string;
  returner: string;
  rallyLength: number;
  patternObserved: string;
  outcome: "Won" | "Lost";
  coachNote: string;
  eliteComparisonAnchor?: string;
};

export type ReportSummary = {
  id: string;
  playerId: string;
  matchSessionId: string;
  title: string;
  createdAt: string;
  pressurePointsAnalyzed: number;
  summary: string;
  eliteComparisons: string[];
  strengths: string[];
  vulnerabilities: string[];
  recommendations: string[];
};

export const players: Player[] = [
  {
    id: "player-1",
    name: "Ayaan Malik",
    age: 16,
    handedness: "Right",
    level: "ITF junior",
    playingStyle: "Aggressive baseliner",
    coach: "Sara Khan",
    pressureWinRate: 58,
    primaryFocus: "First-strike shot selection at deuce",
  },
  {
    id: "player-2",
    name: "Maya Thompson",
    age: 15,
    handedness: "Left",
    level: "National junior",
    playingStyle: "Counterpuncher",
    coach: "Daniel Reyes",
    pressureWinRate: 63,
    primaryFocus: "Return depth on break points",
  },
  {
    id: "player-3",
    name: "Leo Bennett",
    age: 17,
    handedness: "Right",
    level: "College recruit",
    playingStyle: "All-court attacker",
    coach: "Nadia Silva",
    pressureWinRate: 52,
    primaryFocus: "Rally tolerance after missed first serves",
  },
];

export const matchSessions: MatchSession[] = [
  {
    id: "match-1",
    playerId: "player-1",
    opponent: "R. Evans",
    event: "Regional Junior Open QF",
    date: "2026-06-08",
    surface: "Hard",
    score: "6-4, 4-6, 7-6(5)",
    pressurePointsTagged: 3,
    status: "Report drafted",
  },
  {
    id: "match-2",
    playerId: "player-2",
    opponent: "K. Alvarez",
    event: "National Training Set",
    date: "2026-06-11",
    surface: "Clay",
    score: "7-5, 6-3",
    pressurePointsTagged: 2,
    status: "Tagged",
  },
  {
    id: "match-3",
    playerId: "player-3",
    opponent: "J. Park",
    event: "College Showcase Match",
    date: "2026-06-13",
    surface: "Indoor Hard",
    score: "3-6, 6-4, 4-6",
    pressurePointsTagged: 1,
    status: "Ready for tagging",
  },
];

export const pressurePoints: PressurePoint[] = [
  {
    id: "point-1",
    matchSessionId: "match-1",
    playerId: "player-1",
    timestamp: "00:42:18",
    trigger: "Deuce",
    scoreContext: "5-5, second set",
    server: "Ayaan Malik",
    returner: "R. Evans",
    rallyLength: 5,
    patternObserved: "Wide serve, inside-out forehand, forced backhand error",
    outcome: "Won",
    coachNote: "Clear commitment to forehand pattern after the serve.",
    eliteComparisonAnchor: "Federer serve plus-one",
  },
  {
    id: "point-2",
    matchSessionId: "match-1",
    playerId: "player-1",
    timestamp: "01:17:04",
    trigger: "Break Point",
    scoreContext: "3-4, third set",
    server: "R. Evans",
    returner: "Ayaan Malik",
    rallyLength: 11,
    patternObserved: "Neutral return, retreated early, missed crosscourt backhand",
    outcome: "Lost",
    coachNote: "Return target was safe, but court position became too passive.",
    eliteComparisonAnchor: "Djokovic deep-middle return",
  },
  {
    id: "point-3",
    matchSessionId: "match-1",
    playerId: "player-1",
    timestamp: "01:34:51",
    trigger: "Tiebreak",
    scoreContext: "4-4, third-set tiebreak",
    server: "Ayaan Malik",
    returner: "R. Evans",
    rallyLength: 7,
    patternObserved: "First serve to body, forehand to open court, cautious volley finish",
    outcome: "Won",
    coachNote: "Good pattern clarity, but the closing volley needed cleaner footwork.",
    eliteComparisonAnchor: "Alcaraz forward transition",
  },
  {
    id: "point-4",
    matchSessionId: "match-2",
    playerId: "player-2",
    timestamp: "00:58:36",
    trigger: "Set Point",
    scoreContext: "6-5, first set",
    server: "Maya Thompson",
    returner: "K. Alvarez",
    rallyLength: 8,
    patternObserved: "Body serve, heavy crosscourt forehand, backhand line finish",
    outcome: "Won",
    coachNote: "Used height and margin before changing direction.",
    eliteComparisonAnchor: "Nadal margin before attack",
  },
  {
    id: "point-5",
    matchSessionId: "match-2",
    playerId: "player-2",
    timestamp: "01:11:09",
    trigger: "Break Point",
    scoreContext: "2-1, second set",
    server: "K. Alvarez",
    returner: "Maya Thompson",
    rallyLength: 4,
    patternObserved: "Deep middle return, early forehand error from opponent",
    outcome: "Won",
    coachNote: "Return shape removed angle and gave her first neutral ball.",
    eliteComparisonAnchor: "Djokovic deep-middle return",
  },
  {
    id: "point-6",
    matchSessionId: "match-3",
    playerId: "player-3",
    timestamp: "00:49:22",
    trigger: "30-30",
    scoreContext: "2-3, second set",
    server: "Leo Bennett",
    returner: "J. Park",
    rallyLength: 13,
    patternObserved: "Missed first serve, extended backhand exchange, forehand approach winner",
    outcome: "Won",
    coachNote: "Stayed patient after the second serve and chose the right approach ball.",
    eliteComparisonAnchor: "Sinner baseline hold",
  },
];

type EliteSampleInput = Pick<
  ElitePressurePoint,
  | "id"
  | "elitePlayer"
  | "pressureTrigger"
  | "surface"
  | "serveOrReturn"
  | "rallyLength"
  | "primaryPattern"
  | "tacticalPrinciple"
  | "coachingTakeaway"
  | "tags"
> &
  Partial<ElitePressurePoint>;

function eliteSample(input: EliteSampleInput): ElitePressurePoint {
  return {
    opponent: "Elite opponent (sample)",
    matchTournament: "Mock elite match review",
    year: 2025,
    setScore: "Deciding set",
    gameScore: "5-5",
    pointScore: input.pressureTrigger,
    timestamp: `00:${input.id.slice(-2).padStart(2, "0")}:00`,
    sourceLink: "#",
    clipFileName: `${input.id}-sample.mp4`,
    playerToAnalyze: input.elitePlayer,
    serverIfKnown: input.serveOrReturn === "Serve" ? input.elitePlayer : "Opponent",
    uploaderNote: "Mock/sample row; replace with verified clip metadata.",
    pointOutcome: "Won",
    firstServeIn: input.serveOrReturn === "Serve" ? true : null,
    aggressionLevel: "Controlled",
    riskDecision: "Calculated",
    shotThatDecidedPoint: "Final pressure ball in the observed sequence",
    errorOrWinnerType: "Forced error",
    resetBehavior: "Returned to a consistent between-point routine",
    bodyLanguageNote: "Composed posture in this sample observation",
    confidenceLevel: "High",
    aiNotes: "Mock AI-observed draft used only to demonstrate aggregation.",
    reviewStatus: "Approved",
    reviewerCorrection: "Sample human review completed for UI demonstration.",
    approvedForLibrary: true,
    ...input,
  };
}

export const elitePressurePatterns: ElitePressurePoint[] = [
  eliteSample({ id: "elite-01", elitePlayer: "Djokovic", pressureTrigger: "Break Point", surface: "Hard", serveOrReturn: "Return", rallyLength: 4, primaryPattern: "Deep-middle return plus one", tacticalPrinciple: "Remove return angles before taking control of the next ball.", coachingTakeaway: "Give the returner a deep-middle target, then recover on balance.", tags: ["return + 1", "deep middle", "first strike"] }),
  eliteSample({ id: "elite-02", elitePlayer: "Djokovic", pressureTrigger: "Match Point", surface: "Grass", serveOrReturn: "Return", rallyLength: 3, primaryPattern: "Deep-middle return plus one", tacticalPrinciple: "Remove return angles before taking control of the next ball.", coachingTakeaway: "Give the returner a deep-middle target, then recover on balance.", tags: ["return + 1", "compact return", "first strike"] }),
  eliteSample({ id: "elite-03", elitePlayer: "Djokovic", pressureTrigger: "Break Point", surface: "Hard", serveOrReturn: "Return", rallyLength: 11, primaryPattern: "Elastic defense into neutral reset", tacticalPrinciple: "Defend with depth until court position can be rebuilt.", coachingTakeaway: "Train one high-quality neutral ball after the defensive stretch.", tags: ["defensive reset", "depth", "baseline stability"] }),
  eliteSample({ id: "elite-04", elitePlayer: "Djokovic", pressureTrigger: "Tiebreak", surface: "Clay", serveOrReturn: "Serve", rallyLength: 14, primaryPattern: "Elastic defense into neutral reset", tacticalPrinciple: "Defend with depth until court position can be rebuilt.", coachingTakeaway: "Train one high-quality neutral ball after the defensive stretch.", tags: ["defensive reset", "rally tolerance", "controlled aggression"], confidenceLevel: "Medium" }),

  eliteSample({ id: "elite-05", elitePlayer: "Nadal", pressureTrigger: "Break Point", surface: "Clay", serveOrReturn: "Serve", rallyLength: 4, primaryPattern: "Heavy serve plus one to the backhand", tacticalPrinciple: "Use shape and height to earn the first forehand advantage.", coachingTakeaway: "Pair the serve target with a high-margin forehand pattern.", tags: ["serve + 1", "heavy forehand", "first strike"] }),
  eliteSample({ id: "elite-06", elitePlayer: "Nadal", pressureTrigger: "Set Point", surface: "Clay", serveOrReturn: "Serve", rallyLength: 3, primaryPattern: "Heavy serve plus one to the backhand", tacticalPrinciple: "Use shape and height to earn the first forehand advantage.", coachingTakeaway: "Pair the serve target with a high-margin forehand pattern.", tags: ["serve + 1", "forehand shape", "first strike"] }),
  eliteSample({ id: "elite-07", elitePlayer: "Nadal", pressureTrigger: "Deuce", surface: "Clay", serveOrReturn: "Return", rallyLength: 10, primaryPattern: "Heavy crosscourt pressure before direction change", tacticalPrinciple: "Build repeatable margin before attacking open space.", coachingTakeaway: "Require depth and shape before allowing a line change.", tags: ["margin", "direction change", "controlled aggression"] }),
  eliteSample({ id: "elite-08", elitePlayer: "Nadal", pressureTrigger: "Break Point", surface: "Hard", serveOrReturn: "Return", rallyLength: 13, primaryPattern: "Heavy crosscourt pressure before direction change", tacticalPrinciple: "Build repeatable margin before attacking open space.", coachingTakeaway: "Require depth and shape before allowing a line change.", tags: ["rally tolerance", "heavy forehand", "controlled aggression"], confidenceLevel: "Medium" }),

  eliteSample({ id: "elite-09", elitePlayer: "Federer", pressureTrigger: "Break Point", surface: "Grass", serveOrReturn: "Serve", rallyLength: 3, primaryPattern: "Wide serve plus one into open court", tacticalPrinciple: "Use serve location to make the first forehand predictable.", coachingTakeaway: "Call the serve and plus-one targets before the pressure point.", tags: ["serve + 1", "first strike", "court opening"] }),
  eliteSample({ id: "elite-10", elitePlayer: "Federer", pressureTrigger: "Tiebreak", surface: "Hard", serveOrReturn: "Serve", rallyLength: 4, primaryPattern: "Wide serve plus one into open court", tacticalPrinciple: "Use serve location to make the first forehand predictable.", coachingTakeaway: "Call the serve and plus-one targets before the pressure point.", tags: ["serve + 1", "forehand", "first strike"] }),
  eliteSample({ id: "elite-11", elitePlayer: "Federer", pressureTrigger: "Deuce", surface: "Hard", serveOrReturn: "Return", rallyLength: 8, primaryPattern: "Early baseline position with controlled redirection", tacticalPrinciple: "Hold court position and redirect without adding unnecessary pace.", coachingTakeaway: "Reward early contact when balance and court position are secure.", tags: ["early contact", "redirection", "controlled aggression"] }),
  eliteSample({ id: "elite-12", elitePlayer: "Federer", pressureTrigger: "Set Point", surface: "Grass", serveOrReturn: "Serve", rallyLength: 9, primaryPattern: "Early baseline position with controlled redirection", tacticalPrinciple: "Hold court position and redirect without adding unnecessary pace.", coachingTakeaway: "Reward early contact when balance and court position are secure.", tags: ["baseline position", "transition", "controlled aggression"], confidenceLevel: "Medium" }),

  eliteSample({ id: "elite-13", elitePlayer: "Alcaraz", pressureTrigger: "Tiebreak", surface: "Grass", serveOrReturn: "Serve", rallyLength: 3, primaryPattern: "Serve plus one full-blitz transition", tacticalPrinciple: "Convert a clear first-ball advantage into forward court position.", coachingTakeaway: "Use a visible short-ball cue to trigger the full forward transition.", tags: ["serve + 1", "full blitz", "first strike"], aggressionLevel: "High" }),
  eliteSample({ id: "elite-14", elitePlayer: "Alcaraz", pressureTrigger: "Break Point", surface: "Hard", serveOrReturn: "Return", rallyLength: 4, primaryPattern: "Serve plus one full-blitz transition", tacticalPrinciple: "Convert a clear first-ball advantage into forward court position.", coachingTakeaway: "Use a visible short-ball cue to trigger the full forward transition.", tags: ["return + 1", "full blitz", "first strike"], aggressionLevel: "High" }),
  eliteSample({ id: "elite-15", elitePlayer: "Alcaraz", pressureTrigger: "Tiebreak", surface: "Clay", serveOrReturn: "Return", rallyLength: 9, primaryPattern: "Defensive reset followed by explosive acceleration", tacticalPrinciple: "Reset the point before accelerating from stable balance.", coachingTakeaway: "Separate the neutral reset cue from the later attack cue.", tags: ["defensive reset", "acceleration", "long rally"] }),
  eliteSample({ id: "elite-16", elitePlayer: "Alcaraz", pressureTrigger: "Match Point", surface: "Hard", serveOrReturn: "Serve", rallyLength: 12, primaryPattern: "Defensive reset followed by explosive acceleration", tacticalPrinciple: "Reset the point before accelerating from stable balance.", coachingTakeaway: "Separate the neutral reset cue from the later attack cue.", tags: ["defensive reset", "full blitz", "long rally"], reviewStatus: "In Review", approvedForLibrary: false, confidenceLevel: "Medium" }),

  eliteSample({ id: "elite-17", elitePlayer: "Sinner", pressureTrigger: "30-30", surface: "Indoor Hard", serveOrReturn: "Return", rallyLength: 4, primaryPattern: "Early return plus one baseline takeover", tacticalPrinciple: "Take time away while preserving balance through the first two balls.", coachingTakeaway: "Train the return and next ball as one connected pressure pattern.", tags: ["return + 1", "early contact", "first strike"] }),
  eliteSample({ id: "elite-18", elitePlayer: "Sinner", pressureTrigger: "Break Point", surface: "Hard", serveOrReturn: "Serve", rallyLength: 3, primaryPattern: "Early return plus one baseline takeover", tacticalPrinciple: "Take time away while preserving balance through the first two balls.", coachingTakeaway: "Train the return and next ball as one connected pressure pattern.", tags: ["serve + 1", "baseline takeover", "first strike"] }),
  eliteSample({ id: "elite-19", elitePlayer: "Sinner", pressureTrigger: "30-30", surface: "Hard", serveOrReturn: "Return", rallyLength: 10, primaryPattern: "Baseline hold before pace redirection", tacticalPrinciple: "Absorb pace without yielding baseline position, then redirect.", coachingTakeaway: "Build baseline-hold tolerance before introducing the line change.", tags: ["baseline hold", "redirection", "controlled aggression"] }),
  eliteSample({ id: "elite-20", elitePlayer: "Sinner", pressureTrigger: "Set Point", surface: "Indoor Hard", serveOrReturn: "Serve", rallyLength: 8, primaryPattern: "Baseline hold before pace redirection", tacticalPrinciple: "Absorb pace without yielding baseline position, then redirect.", coachingTakeaway: "Build baseline-hold tolerance before introducing the line change.", tags: ["baseline hold", "pace absorption", "long rally"], reviewStatus: "In Review", approvedForLibrary: false, confidenceLevel: "Medium" }),
];

export const reportSummaries: ReportSummary[] = [
  {
    id: "report-1",
    playerId: "player-1",
    matchSessionId: "match-1",
    title: "Ayaan Malik pressure-point review",
    createdAt: "2026-06-14",
    pressurePointsAnalyzed: 3,
    summary:
      "Ayaan created value when he committed early to serve plus-one patterns, but return points under break pressure still need clearer court-position rules.",
    eliteComparisons: ["Federer serve plus-one", "Djokovic deep-middle return"],
    strengths: [
      "Committed to forehand patterns when serving at deuce.",
      "Improved first-ball clarity in tiebreak points.",
    ],
    vulnerabilities: [
      "Return games became passive on second break-point chances.",
      "Backhand tolerance dropped after long neutral rallies.",
    ],
    recommendations: [
      "Build a two-target return plan for break points.",
      "Rehearse deuce patterns with serve location called before the point.",
      "Add backhand crosscourt tolerance blocks after missed first serves.",
    ],
  },
  {
    id: "report-2",
    playerId: "player-2",
    matchSessionId: "match-2",
    title: "Maya Thompson pressure-point review",
    createdAt: "2026-06-15",
    pressurePointsAnalyzed: 2,
    summary:
      "Maya handled set and break points with disciplined return targets and high-margin rally shape before changing direction.",
    eliteComparisons: ["Nadal margin before attack", "Djokovic deep-middle return"],
    strengths: [
      "Used body serves and heavy shape to protect set-point leads.",
      "Return depth improved when defending second-serve break points.",
    ],
    vulnerabilities: [
      "Can become late to recover after wide forehand patterns on clay.",
      "Occasional hesitation before attacking short backhands.",
    ],
    recommendations: [
      "Keep the deep-middle return as the default break-point target.",
      "Add recovery-position cues after wide forehands.",
      "Use controlled backhand-line acceleration only after depth is established.",
    ],
  },
];

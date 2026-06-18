export type PressureTrigger =
  | "30-30"
  | "Deuce"
  | "Advantage"
  | "Break Point"
  | "Set Point"
  | "Match Point"
  | "Tiebreak";

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

export type ElitePressurePattern = {
  id: string;
  player: "Federer" | "Nadal" | "Djokovic" | "Alcaraz" | "Sinner";
  opponent: string;
  match: string;
  year: number;
  surface: "Hard" | "Clay" | "Grass" | "Indoor Hard";
  setScore: string;
  gameScore: string;
  pointScore: string;
  scoreContext: string;
  pressureTrigger: PressureTrigger;
  timestamp: string;
  sourceLabel: string;
  sourceUrl: string;
  serveOrReturn: "Serve" | "Return";
  outcome: "Won" | "Lost";
  firstServeIn: boolean | null;
  rallyLength: number;
  primaryPattern: string;
  aggressionLevel: "Controlled" | "Balanced" | "High";
  riskDecision: string;
  shotThatDecidedPoint: string;
  errorOrWinnerType: string;
  resetBehavior: string;
  bodyLanguageNote: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string[];
  confidenceLevel: "Low" | "Medium" | "High";
  notes: string;
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

export const elitePressurePatterns: ElitePressurePattern[] = [
  {
    id: "elite-1",
    player: "Federer",
    opponent: "Rafael Nadal",
    match: "Grand Slam final review sample",
    year: 2017,
    surface: "Hard",
    setScore: "Fifth set",
    gameScore: "3-3",
    pointScore: "30-40",
    scoreContext: "Serving at 3-3 in the deciding set, break point down",
    pressureTrigger: "Break Point",
    timestamp: "02:41:18",
    sourceLabel: "Video source pending verification",
    sourceUrl: "#",
    serveOrReturn: "Serve",
    outcome: "Won",
    firstServeIn: true,
    rallyLength: 3,
    primaryPattern: "Wide first serve followed by an early forehand into open court",
    aggressionLevel: "Controlled",
    riskDecision: "Accepted first-strike risk from a rehearsed serve-plus-one pattern",
    shotThatDecidedPoint: "Forehand to the open court",
    errorOrWinnerType: "Forced error",
    resetBehavior: "Turned away from the baseline and reset immediately for the next point",
    bodyLanguageNote: "Compact routine and neutral posture before serving",
    tacticalPrinciple: "Use serve location to create a predictable first forehand",
    coachingTakeaway: "Define the serve and plus-one target before high-pressure service points.",
    tags: ["break point", "serve plus one", "first strike"],
    confidenceLevel: "Medium",
    notes: "Mock review record; match identity and timestamp require source validation.",
  },
  {
    id: "elite-2",
    player: "Nadal",
    opponent: "Novak Djokovic",
    match: "Clay final review sample",
    year: 2020,
    surface: "Clay",
    setScore: "First set",
    gameScore: "4-0",
    pointScore: "Deuce",
    scoreContext: "Returning at deuce with an opportunity to extend pressure",
    pressureTrigger: "Deuce",
    timestamp: "00:38:42",
    sourceLabel: "Video source pending verification",
    sourceUrl: "#",
    serveOrReturn: "Return",
    outcome: "Won",
    firstServeIn: true,
    rallyLength: 9,
    primaryPattern: "Heavy crosscourt forehand height before changing direction",
    aggressionLevel: "Balanced",
    riskDecision: "Built depth and shape before selecting the line change",
    shotThatDecidedPoint: "Forehand down the line",
    errorOrWinnerType: "Clean winner",
    resetBehavior: "Returned quickly to the receiving position with the same routine",
    bodyLanguageNote: "High physical intensity without rushing between shots",
    tacticalPrinciple: "Create pressure with repeatable margin before attacking space",
    coachingTakeaway: "Under pressure, establish height and depth before changing direction.",
    tags: ["deuce", "heavy forehand", "margin", "direction change"],
    confidenceLevel: "Medium",
    notes: "Mock review record; point sequence must be checked against source footage.",
  },
  {
    id: "elite-3",
    player: "Djokovic",
    opponent: "Roger Federer",
    match: "Grass final review sample",
    year: 2019,
    surface: "Grass",
    setScore: "Fifth set",
    gameScore: "7-8",
    pointScore: "30-40",
    scoreContext: "Returning on championship point in the deciding set",
    pressureTrigger: "Match Point",
    timestamp: "04:47:06",
    sourceLabel: "Video source pending verification",
    sourceUrl: "#",
    serveOrReturn: "Return",
    outcome: "Won",
    firstServeIn: true,
    rallyLength: 4,
    primaryPattern: "Compact return through the middle followed by stable baseline position",
    aggressionLevel: "Controlled",
    riskDecision: "Prioritized return depth and central geometry over an outright return attack",
    shotThatDecidedPoint: "Backhand passing response",
    errorOrWinnerType: "Opponent forced error",
    resetBehavior: "Minimal celebration; immediately restored breathing and position",
    bodyLanguageNote: "Still head and balanced receiving stance",
    tacticalPrinciple: "Remove angles and make the server execute an additional ball",
    coachingTakeaway: "Use a compact deep-middle return target when the cost of a miss is highest.",
    tags: ["match point", "return", "deep middle", "baseline stability"],
    confidenceLevel: "High",
    notes: "Mock structured interpretation based on a known match context; timestamp remains a placeholder.",
  },
  {
    id: "elite-4",
    player: "Alcaraz",
    opponent: "Novak Djokovic",
    match: "Grand Slam final review sample",
    year: 2023,
    surface: "Grass",
    setScore: "Second set",
    gameScore: "6-6",
    pointScore: "4-4",
    scoreContext: "Level in the second-set tiebreak after losing the opening set",
    pressureTrigger: "Tiebreak",
    timestamp: "01:32:24",
    sourceLabel: "Video source pending verification",
    sourceUrl: "#",
    serveOrReturn: "Serve",
    outcome: "Won",
    firstServeIn: true,
    rallyLength: 6,
    primaryPattern: "Forehand acceleration followed by a committed forward transition",
    aggressionLevel: "High",
    riskDecision: "Attacked the first ball that created clear court-position advantage",
    shotThatDecidedPoint: "Forehand approach",
    errorOrWinnerType: "Forced passing-shot error",
    resetBehavior: "Positive fist response, then a deliberate walk to the next position",
    bodyLanguageNote: "Energetic but organized before initiating the point",
    tacticalPrinciple: "Aggression is strongest when paired with forward court position",
    coachingTakeaway: "Link acceleration to a clear transition cue instead of attacking from static position.",
    tags: ["tiebreak", "forehand", "transition", "proactive"],
    confidenceLevel: "Medium",
    notes: "Mock review record; exact score sequence and timestamp require validation.",
  },
  {
    id: "elite-5",
    player: "Sinner",
    opponent: "Daniil Medvedev",
    match: "Grand Slam final review sample",
    year: 2024,
    surface: "Hard",
    setScore: "Fifth set",
    gameScore: "3-2",
    pointScore: "30-30",
    scoreContext: "Returning at 30-30 while leading by a break in the deciding set",
    pressureTrigger: "30-30",
    timestamp: "03:31:50",
    sourceLabel: "Video source pending verification",
    sourceUrl: "#",
    serveOrReturn: "Return",
    outcome: "Won",
    firstServeIn: false,
    rallyLength: 8,
    primaryPattern: "Held the baseline through backhand exchanges before redirecting pace",
    aggressionLevel: "Balanced",
    riskDecision: "Waited for a shorter neutral ball before changing direction",
    shotThatDecidedPoint: "Backhand down the line",
    errorOrWinnerType: "Forced forehand error",
    resetBehavior: "No visible reaction beyond turning promptly to the next point",
    bodyLanguageNote: "Low emotional variance and stable posture",
    tacticalPrinciple: "Absorb pace without yielding baseline position, then redirect",
    coachingTakeaway: "Train baseline holds under score pressure before introducing direction changes.",
    tags: ["30-30", "backhand", "baseline", "redirection"],
    confidenceLevel: "Medium",
    notes: "Mock review record; source footage and point metadata have not been verified.",
  },
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

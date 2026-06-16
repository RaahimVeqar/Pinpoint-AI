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
  trigger: PressureTrigger;
  phase: "Serve" | "Return" | "Rally";
  pattern: string;
  tacticalTheme: string;
  coachingApplication: string;
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
    trigger: "Break Point",
    phase: "Serve",
    pattern: "Fast first serve to open the forehand, then immediate court position gain.",
    tacticalTheme: "Shorten the point with controlled aggression",
    coachingApplication: "Define a first-serve plus-one target before the point starts.",
  },
  {
    id: "elite-2",
    player: "Nadal",
    trigger: "Deuce",
    phase: "Rally",
    pattern: "Heavy crosscourt forehand height to the backhand before attacking space.",
    tacticalTheme: "Build pressure through margin and repeatable shape",
    coachingApplication: "Use height and depth as the first pressure response.",
  },
  {
    id: "elite-3",
    player: "Djokovic",
    trigger: "Break Point",
    phase: "Return",
    pattern: "Deep middle return that removes angle and starts the point neutral.",
    tacticalTheme: "Deny the server a clean first strike",
    coachingApplication: "Train a reliable deep-middle return target under scoreboard stress.",
  },
  {
    id: "elite-4",
    player: "Alcaraz",
    trigger: "Tiebreak",
    phase: "Rally",
    pattern: "Early forehand acceleration followed by a forward transition when space opens.",
    tacticalTheme: "Proactive variety without abandoning court position",
    coachingApplication: "Pair aggressive intent with a defined recovery position.",
  },
  {
    id: "elite-5",
    player: "Sinner",
    trigger: "30-30",
    phase: "Rally",
    pattern: "Clean backhand redirection after absorbing pace through the middle.",
    tacticalTheme: "Hold the baseline and redirect with low emotional variance",
    coachingApplication: "Practice calm baseline holds before changing direction.",
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

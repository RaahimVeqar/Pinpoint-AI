import type {
  PlayerClip,
  SavedClipAnalysis,
  SavedPlayerReport,
} from "@/lib/pinpoint-types";

export const savedPlayerClips: PlayerClip[] = [
  {
    id: "clip-hassan-serve-short-lost",
    playerName: "Hassan Veqar",
    matchSession: "Academy pressure set - Court 2 - 2026-06-22",
    clipTitle: "Deuce serve plus-one, early forehand acceleration",
    clipSource: "Mock clip link - no uploaded file",
    timestampOrRange: "00:18:42-00:18:55",
    scoreContext: "4-4, deuce, first set",
    pressureTrigger: "Deuce",
    playerPointOutcome: "Lost",
    pointPatternFamily: "Short First-Strike / Serve Plus-One",
    createdAt: "2026-06-22",
  },
  {
    id: "clip-hassan-rally-lost",
    playerName: "Hassan Veqar",
    matchSession: "Academy pressure set - Court 2 - 2026-06-22",
    clipTitle: "Break point sustained rally, backhand tolerance",
    clipSource: "Mock clip link - no uploaded file",
    timestampOrRange: "00:41:08-00:41:31",
    scoreContext: "2-3, break point, second set",
    pressureTrigger: "Break Point",
    playerPointOutcome: "Lost",
    pointPatternFamily: "Sustained Rally / Baseline Hold",
    createdAt: "2026-06-22",
  },
  {
    id: "clip-academy-a-return-won",
    playerName: "Academy Player A",
    matchSession: "National training match - 2026-06-25",
    clipTitle: "Break point return through middle into neutral control",
    clipSource: "Mock clip link - no uploaded file",
    timestampOrRange: "01:03:14-01:03:29",
    scoreContext: "5-5, break point, deciding set",
    pressureTrigger: "Break Point",
    playerPointOutcome: "Won",
    pointPatternFamily: "Return Pressure / Deep-Middle Neutralization",
    createdAt: "2026-06-25",
  },
  {
    id: "clip-academy-b-tiebreak-review",
    playerName: "Academy Player B",
    matchSession: "Indoor matchplay review - 2026-06-27",
    clipTitle: "Tiebreak transition choice after short ball",
    clipSource: "Mock clip link - no uploaded file",
    timestampOrRange: "00:56:02-00:56:19",
    scoreContext: "4-4, tiebreak",
    pressureTrigger: "Tiebreak",
    playerPointOutcome: "Lost",
    pointPatternFamily: "Transition Pressure / Short-Ball Decision",
    createdAt: "2026-06-27",
  },
];

export const savedClipAnalyses: SavedClipAnalysis[] = [
  {
    id: "analysis-hassan-serve-short-lost",
    clipId: "clip-hassan-serve-short-lost",
    playerName: "Hassan Veqar",
    matchSession: "Academy pressure set - Court 2 - 2026-06-22",
    playerPointOutcome: "Lost",
    pressurePatternFamily: "Short First-Strike / Serve Plus-One",
    whatHappened:
      "Hassan created a neutral start with the serve, then tried to finish with the first forehand before the court position was clearly earned.",
    likelyBreakdownMoment:
      "The point shifted when the plus-one forehand was played to a smaller target from a balanced but not dominant position.",
    decisionQuality:
      "The first-strike intent fits the pressure moment, but the attack cue came too early for the ball quality available.",
    executionQuality:
      "Contact and spacing were slightly rushed, which reduced margin on the forehand target.",
    missedOpportunity:
      "Use one heavier crosscourt ball to build space before changing direction or finishing.",
    eliteReferencePattern: "Federer wide serve plus-one into open court",
    eliteComparison:
      "The elite pattern keeps the serve and plus-one connected, but the acceleration usually follows a clearer court-opening cue.",
    nextTimeAdjustment:
      "Call the serve location and plus-one target, then choose a larger target unless the return is short or stretched.",
    trainingFocus:
      "Serve plus-one decision gates: attack only after the serve opens space; otherwise build with heavy crosscourt margin.",
    coachingTakeaway:
      "Keep the attacking identity. The next step is to make the first-strike choice more conditional and repeatable.",
    confidenceLevel: "High",
    reviewStatus: "Approved",
    createdAt: "2026-06-22",
  },
  {
    id: "analysis-hassan-rally-lost",
    clipId: "clip-hassan-rally-lost",
    playerName: "Hassan Veqar",
    matchSession: "Academy pressure set - Court 2 - 2026-06-22",
    playerPointOutcome: "Lost",
    pressurePatternFamily: "Sustained Rally / Baseline Hold",
    whatHappened:
      "The rally stayed neutral for several balls before Hassan yielded baseline position and missed while trying to redirect from a lower-quality backhand.",
    likelyBreakdownMoment:
      "The breakdown appears around the ninth ball, when recovery depth dropped and the backhand redirection came from a defensive base.",
    decisionQuality:
      "The direction change had a clear intention, but it was selected before balance and court position were restored.",
    executionQuality:
      "Backhand contact was late after the recovery step, so the line-change window was not stable.",
    missedOpportunity:
      "Reset one more ball deep through the middle or crosscourt before asking for the redirection.",
    eliteReferencePattern: "Sinner baseline hold before pace redirection",
    eliteComparison:
      "The closest elite pattern is baseline hold before redirection: absorb the rally without giving ground, then change direction from a stable base.",
    nextTimeAdjustment:
      "When stretched in a long pressure rally, play one deep neutral ball first and delay the line change until balance returns.",
    trainingFocus:
      "Backhand crosscourt tolerance blocks with a required neutral reset before any down-the-line change.",
    coachingTakeaway:
      "This is a rally-tolerance opportunity, not just an error review. Build the reset cue that lets Hassan stay in the point longer.",
    confidenceLevel: "Medium",
    reviewStatus: "Approved",
    createdAt: "2026-06-22",
  },
  {
    id: "analysis-academy-a-return-won",
    clipId: "clip-academy-a-return-won",
    playerName: "Academy Player A",
    matchSession: "National training match - 2026-06-25",
    playerPointOutcome: "Won",
    pressurePatternFamily: "Return Pressure / Deep-Middle Neutralization",
    whatHappened:
      "The player returned through the middle, held the baseline, and waited for a balanced ball before redirecting.",
    likelyBreakdownMoment:
      "There was no player breakdown; the point turned when the opponent had to attack from a neutralized middle return.",
    decisionQuality:
      "The return target was disciplined and matched the break-point context.",
    executionQuality:
      "Return depth and recovery posture supported the next-ball decision.",
    missedOpportunity:
      "No major missed opportunity. The next layer is recognizing when the opponent leaves a shorter second ball.",
    eliteReferencePattern: "Djokovic deep-middle return plus one",
    eliteComparison:
      "The point aligns with elite deep-middle return patterns that remove angle and create a stable first neutral exchange.",
    nextTimeAdjustment:
      "Repeat the deep-middle return target and prepare the next-ball decision before contact.",
    trainingFocus:
      "Break-point return plus one: middle target, balanced recovery, then controlled redirection.",
    coachingTakeaway:
      "This is a useful model clip for pressure-return discipline and should be included in report evidence.",
    confidenceLevel: "High",
    reviewStatus: "Approved",
    createdAt: "2026-06-25",
  },
  {
    id: "analysis-academy-b-tiebreak-review",
    clipId: "clip-academy-b-tiebreak-review",
    playerName: "Academy Player B",
    matchSession: "Indoor matchplay review - 2026-06-27",
    playerPointOutcome: "Lost",
    pressurePatternFamily: "Transition Pressure / Short-Ball Decision",
    whatHappened:
      "The player received a short ball in a tiebreak exchange and moved forward, but the clip angle does not clearly show whether the approach target was open.",
    likelyBreakdownMoment:
      "The likely decision point is the transition step into the short ball, though coach review is needed before assigning the main cause.",
    decisionQuality:
      "Potentially appropriate attacking intent, with uncertainty around court geometry and opponent position.",
    executionQuality:
      "The contact looked slightly late, but the available footage is not clear enough for a final grade.",
    missedOpportunity:
      "Possible missed opportunity to approach through the bigger target and recover closer to the center line.",
    eliteReferencePattern: "Alcaraz short-ball transition after reset",
    eliteComparison:
      "The relevant elite pattern is controlled transition after the short-ball cue, but this analysis should remain provisional until reviewed.",
    nextTimeAdjustment:
      "Use the short-ball cue, but choose the larger approach target unless the opponent is visibly stretched.",
    trainingFocus:
      "Tiebreak short-ball transition reps with coach-called target zones and recovery checkpoints.",
    coachingTakeaway:
      "Keep this as a coach-review clip. The feedback should stay constructive until the footage confirms the decision and execution details.",
    confidenceLevel: "Low",
    reviewStatus: "Needs Review",
    createdAt: "2026-06-27",
  },
];

export const savedPlayerReports: SavedPlayerReport[] = [
  {
    id: "report-hassan-pressure-set",
    playerName: "Hassan Veqar",
    matchSession: "Academy pressure set - Court 2 - 2026-06-22",
    clipAnalysisIds: [
      "analysis-hassan-serve-short-lost",
      "analysis-hassan-rally-lost",
    ],
    overallPressureTendency:
      "Hassan wants to stay proactive under pressure, with the main growth area around when to build one more ball before accelerating.",
    recurringBreakdowns: [
      "Early attack before court position is fully created.",
      "Backhand redirection from a defensive base in longer rallies.",
    ],
    eliteComparisonSummary:
      "Current comparisons point toward Federer-style serve plus-one structure and Sinner-style baseline hold before redirection.",
    coachingPriorities: [
      "Define serve plus-one decision gates.",
      "Train one-ball neutral resets before line changes.",
      "Use lost-point clips as next-time adjustment examples.",
    ],
    nextSessionFocus:
      "Pressure games starting at deuce with called serve patterns and backhand tolerance constraints.",
    createdAt: "2026-06-22",
  },
  {
    id: "report-academy-a-training",
    playerName: "Academy Player A",
    matchSession: "National training match - 2026-06-25",
    clipAnalysisIds: ["analysis-academy-a-return-won"],
    overallPressureTendency:
      "The player showed strong return discipline on break point by removing angle before redirecting.",
    recurringBreakdowns: [],
    eliteComparisonSummary:
      "The saved clip maps cleanly to Djokovic-style deep-middle return and balanced next-ball control.",
    coachingPriorities: [
      "Keep the deep-middle return as the default pressure target.",
      "Add second-ball recognition after the neutralized return.",
    ],
    nextSessionFocus:
      "Break-point return plus-one reps with a required recovery balance check.",
    createdAt: "2026-06-25",
  },
];


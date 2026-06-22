/**
 * ============================================================================
 *  TRIAGE POLICY — SAFETY-CRITICAL, SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 *  This module is the ONE inspectable place that decides whether a patient
 *  intake is URGENT (red-flag) and therefore must be routed to NURSE REVIEW
 *  ahead of / outside the normal waiting queue.
 *
 *  NON-NEGOTIABLE RULE:
 *    A submission whose reason-for-visit / symptoms match the urgent set
 *    (e.g. "chest pain") MUST be flagged URGENT and routed to the nurse-review
 *    lane. It must NEVER land in the normal waiting queue.
 *
 *  This file is intentionally framework-free and dependency-free so it can be
 *  imported on BOTH the server (queue-entry creation) and the client (live
 *  inline feedback in the intake form), guaranteeing the routing decision is
 *  identical everywhere and easy to trace.
 *
 *  To extend the policy, edit `URGENT_SYMPTOM_RULES` below. Each rule lists the
 *  match terms (case-insensitive substring match) for a red-flag presentation.
 * ============================================================================
 */

export type TriageLevel = "URGENT" | "ROUTINE";

/** A single red-flag rule: a clinical label plus the phrases that match it. */
export interface UrgentSymptomRule {
  /** Stable identifier for the red-flag category. */
  id: string;
  /** Human-readable clinical label shown to staff. */
  label: string;
  /**
   * Lowercase match terms. If ANY term appears (as a substring) in the
   * patient's reason-for-visit text, this rule fires and the intake is URGENT.
   */
  terms: string[];
}

/**
 * The urgent-symptom catalogue. Chest pain is the canonical acceptance case
 * and is listed first. Extend this array to broaden triage coverage.
 */
export const URGENT_SYMPTOM_RULES: UrgentSymptomRule[] = [
  {
    id: "chest_pain",
    label: "Chest pain",
    terms: ["chest pain", "chest pressure", "chest tightness", "pain in chest"],
  },
  {
    id: "breathing_difficulty",
    label: "Difficulty breathing",
    terms: [
      "difficulty breathing",
      "trouble breathing",
      "shortness of breath",
      "short of breath",
      "can't breathe",
      "cant breathe",
      "can not breathe",
      "struggling to breathe",
      "gasping",
    ],
  },
  {
    id: "severe_bleeding",
    label: "Severe bleeding",
    terms: ["severe bleeding", "heavy bleeding", "uncontrolled bleeding", "won't stop bleeding", "wont stop bleeding", "bleeding heavily"],
  },
  {
    id: "stroke_signs",
    label: "Stroke signs",
    terms: [
      "stroke",
      "face drooping",
      "facial droop",
      "slurred speech",
      "slurring",
      "sudden weakness",
      "numbness one side",
      "arm weakness",
      "cannot speak",
    ],
  },
  {
    id: "cardiac_arrest",
    label: "Cardiac / loss of consciousness",
    terms: ["heart attack", "cardiac arrest", "unconscious", "passed out", "fainted", "unresponsive", "collapsed"],
  },
  {
    id: "severe_allergic",
    label: "Severe allergic reaction",
    terms: ["anaphylaxis", "anaphylactic", "throat closing", "severe allergic", "swollen throat", "swelling throat"],
  },
  {
    id: "suicidal",
    label: "Mental health crisis",
    terms: ["suicidal", "suicide", "kill myself", "self harm", "self-harm", "overdose", "want to die"],
  },
];

/** The result of running an intake through the triage policy. */
export interface TriageDecision {
  level: TriageLevel;
  /** True when the intake must route to nurse review (URGENT). */
  isUrgent: boolean;
  /** The clinical labels of every rule that matched (empty when ROUTINE). */
  matchedLabels: string[];
  /** The rule ids that matched, for tracing/auditing. */
  matchedRuleIds: string[];
}

/**
 * Evaluate a patient's reason-for-visit / symptom text against the urgent
 * policy. This is the single decision function the whole app relies on.
 *
 * @param reasonForVisit free-text reason for visit / symptoms
 * @returns a fully-explained triage decision
 */
export function evaluateTriage(reasonForVisit: string | null | undefined): TriageDecision {
  const haystack = (reasonForVisit ?? "").toLowerCase();

  const matchedLabels: string[] = [];
  const matchedRuleIds: string[] = [];

  if (haystack.trim().length > 0) {
    for (const rule of URGENT_SYMPTOM_RULES) {
      const hit = rule.terms.some((term) => haystack.includes(term));
      if (hit) {
        matchedLabels.push(rule.label);
        matchedRuleIds.push(rule.id);
      }
    }
  }

  const isUrgent = matchedRuleIds.length > 0;

  return {
    level: isUrgent ? "URGENT" : "ROUTINE",
    isUrgent,
    matchedLabels,
    matchedRuleIds,
  };
}

/** Convenience: does this reason-for-visit require nurse review? */
export function requiresNurseReview(reasonForVisit: string | null | undefined): boolean {
  return evaluateTriage(reasonForVisit).isUrgent;
}

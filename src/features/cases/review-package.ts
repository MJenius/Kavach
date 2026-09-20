import type { AIInvestigationResult, TripEvent } from '../../domain/index.ts';

export interface ReviewPackageNavigationState {
  type: 'generated-review-package';
  caseId: string;
  tripId: string;
  workerId: string;
  workerName: string;
  disputedAmount: number;
  caseStatus: 'READY' | 'REVIEW' | 'DRAFT' | 'ANALYZING' | 'RESOLVED';
  investigation: AIInvestigationResult;
  timeline: TripEvent[];
  packageUri?: string;
  generatedAt?: string;
}

export interface GenerateReviewPackageParams {
  caseId: string;
  tripId: string;
  workerName: string;
  disputedAmount: number;
  investigation: AIInvestigationResult;
  timeline: TripEvent[];
}

const STORAGE_KEY_PREFIX = 'kavach_review_package_';
const inMemoryFallbackStore = new Map<string, string>();

/**
 * Persist generated review package state into localStorage (or memory in Node/SSR) for seamless reload persistence.
 */
export function saveStoredReviewPackage(state: ReviewPackageNavigationState): void {
  const jsonStr = JSON.stringify({ ...state, savedAt: new Date().toISOString() });
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${state.caseId}`, jsonStr);
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}last`, jsonStr);
    }
  } catch (e) {
    console.warn('Unable to persist package to localStorage', e);
  }
  inMemoryFallbackStore.set(`${STORAGE_KEY_PREFIX}${state.caseId}`, jsonStr);
  inMemoryFallbackStore.set(`${STORAGE_KEY_PREFIX}last`, jsonStr);
}

/**
 * Retrieve persisted review package state for a case from localStorage (or memory in Node/SSR).
 */
export function getStoredReviewPackage(caseId?: string): ReviewPackageNavigationState | null {
  const key = caseId ? `${STORAGE_KEY_PREFIX}${caseId}` : `${STORAGE_KEY_PREFIX}last`;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as ReviewPackageNavigationState;
      }
    }
  } catch (e) {
    console.warn('Unable to read persisted package from localStorage', e);
  }
  const fallbackRaw = inMemoryFallbackStore.get(key);
  if (fallbackRaw) {
    try {
      return JSON.parse(fallbackRaw) as ReviewPackageNavigationState;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Formats ISO timestamp to HH:mm IST for review package plain text.
 */
function formatIST(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(new Date(iso)) + ' IST';
  } catch {
    return iso;
  }
}

/**
 * Pure function to format a structured, evidence-backed review submission package in clean plain text.
 * Strictly avoids legal conclusions and guarantees; uses objective, evidence-grounded phrasing
 * ("available evidence indicates", "warrants review").
 */
export function generateReviewPackage(params: GenerateReviewPackageParams): string {
  const { caseId, tripId, workerName, disputedAmount, investigation, timeline } = params;

  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('KAVACH AI — FORMAL DISPUTE REVIEW SUBMISSION PACKAGE');
  lines.push('================================================================================');
  lines.push(`Case ID:            ${caseId}`);
  lines.push(`Trip ID:            ${tripId}`);
  lines.push(`Partner Name:       ${workerName}`);
  lines.push(`Disputed Penalty:   ₹${disputedAmount}`);
  lines.push(`Overall Confidence: ${Math.round(investigation.confidence * 100)}%`);
  lines.push(`Status:             Warrants Review / Pending Re-evaluation`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push('');
  lines.push('1. INVESTIGATION SUMMARY');
  lines.push(investigation.summary);
  lines.push('');
  lines.push('--------------------------------------------------------------------------------');
  lines.push('2. FINDINGS & SUPPORTING EVIDENCE');
  if (investigation.findings.length === 0) {
    lines.push('No findings recorded.');
  } else {
    investigation.findings.forEach((finding, index) => {
      lines.push(`Finding ${index + 1}: ${finding.title}`);
      lines.push(`Severity:   ${finding.severity}`);
      lines.push(`Confidence: ${Math.round(finding.confidence * 100)}%`);
      lines.push(`Detail:     ${finding.explanation}`);
      if (finding.evidenceIds && finding.evidenceIds.length > 0) {
        lines.push(`Supporting Evidence IDs: [${finding.evidenceIds.join(', ')}]`);
      }
      lines.push('');
    });
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('3. RECONSTRUCTED TIMELINE');
  if (timeline.length === 0) {
    lines.push('No timeline events available.');
  } else {
    timeline.forEach((event) => {
      const timeStr = formatIST(event.timestamp);
      const evStr = event.evidenceIds && event.evidenceIds.length > 0
        ? ` (Evidence: ${event.evidenceIds.join(', ')})`
        : '';
      lines.push(`- [${timeStr}] ${event.type} | Source: ${event.source}${evStr}`);
    });
  }
  lines.push('');

  if (investigation.contradictions && investigation.contradictions.length > 0) {
    lines.push('--------------------------------------------------------------------------------');
    lines.push('4. CONTRADICTIONS DETECTED');
    investigation.contradictions.forEach((contradiction, index) => {
      lines.push(`${index + 1}. ${contradiction}`);
    });
    lines.push('');
  }

  if (investigation.missingEvidence && investigation.missingEvidence.length > 0) {
    lines.push('--------------------------------------------------------------------------------');
    lines.push('5. MISSING EVIDENCE / VERIFICATION GAPS');
    investigation.missingEvidence.forEach((missing, index) => {
      lines.push(`${index + 1}. ${missing}`);
    });
    lines.push('');
  }

  lines.push('--------------------------------------------------------------------------------');
  lines.push('6. RECOMMENDED ACTIONS');
  if (investigation.recommendedActions && investigation.recommendedActions.length > 0) {
    investigation.recommendedActions.forEach((action, index) => {
      lines.push(`${index + 1}. ${action}`);
    });
  } else {
    lines.push('1. Review documented timeline and consider penalty waiver under merchant-delay policy.');
  }
  lines.push('');

  lines.push('--------------------------------------------------------------------------------');
  lines.push('7. OBJECTIVE ASSESSMENT STATEMENT');
  lines.push(
    'Available evidence indicates that uncompensated merchant preparation and delivery delays occurred beyond partner control. Based on verified telemetry and timestamp reconciliation, the penalty assessment warrants review. This document compiles objective records to support administrative re-examination.'
  );
  lines.push('================================================================================');

  return lines.join('\n');
}

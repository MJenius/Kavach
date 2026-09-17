import { PayoutReconciliation, reconcilePayout } from './earnings.ts';

export interface IncentiveReconciliation extends PayoutReconciliation {
  eligible: boolean | null;
  missingEvidence: string[];
}

export function reconcileIncentive(
  expected: number | undefined,
  actual: number | undefined,
  eligible: boolean | undefined,
  hasRuleEvidence = true
): IncentiveReconciliation {
  const missingEvidence = [
    ...(!hasRuleEvidence ? ['INCENTIVE_RULE'] : []),
    ...(eligible === undefined ? ['ELIGIBILITY'] : []),
  ];
  return { ...reconcilePayout(eligible === false ? 0 : expected, actual), eligible: eligible ?? null, missingEvidence };
}

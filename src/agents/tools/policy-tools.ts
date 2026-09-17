import { PolicyRepository } from './types.ts';

class MockPolicyRepository implements PolicyRepository {
  async findPolicy(platform: string, issueType: string) {
    if (platform === 'QuickBite' && (issueType === 'LATE_DELIVERY' || issueType === 'MERCHANT_DELAY')) {
      return {
        policyName: 'QuickBite Partner SLA Policy',
        clauseReference: 'Section 4.2.1 (Merchant Handover Delays)',
        summaryText: 'Where store preparation delay exceeds 5 minutes, delivery partner SLA will be extended by equivalent wait time and penalties waived upon evidence.',
        sourceUri: 'https://partner.quickbite.in/policies/sla-exemptions#4.2.1',
      };
    }
    return null;
  }
}

let activePolicyRepo: PolicyRepository = new MockPolicyRepository();

export function setPolicyRepository(repo: PolicyRepository): void {
  activePolicyRepo = repo;
}

export async function getRelevantPolicy(platform: string, issueType: string) {
  const policy = await activePolicyRepo.findPolicy(platform, issueType);
  if (!policy) {
    return {
      sourceUnavailable: true,
      policy: null,
      notes: `No canonical policy on record for ${platform} under issue ${issueType}.`,
    };
  }
  return {
    sourceUnavailable: false,
    policy,
    notes: 'Policy retrieved from configured policy repository.',
  };
}

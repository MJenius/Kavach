import { PolicyRepository } from './types.ts';

class MockPolicyRepository implements PolicyRepository {
  async findPolicy(platform: string, issueType: string) {
    if (platform === 'QuickBite' && (issueType === 'LATE_DELIVERY' || issueType === 'MERCHANT_DELAY')) {
      return {
        policyName: 'QuickBite Merchant Handover Terms (Demo Policy Record)',
        clauseReference: 'Merchant Delay Policy Clause 4.2',
        summaryText: 'Demo Policy Record: Where store preparation delay exceeds 5 minutes, delivery partner SLA will be extended by equivalent wait time and penalties waived upon evidence submission.',
        sourceUri: 'local://fixtures/demo-policy-evidence/quickbite-clause-4-2',
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

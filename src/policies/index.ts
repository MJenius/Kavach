/**
 * ============================================================================
 * Policy Retrieval Interface (Person 3 - feature/cloud-platform)
 * ============================================================================
 * Pluggable policy lookup (OpenSearch / Local JSON repository).
 * ============================================================================
 */

export interface PlatformPolicy {
  id: string;
  platform: string;
  section: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface PolicyRepository {
  searchPolicy(platform: string, query: string): Promise<PlatformPolicy[]>;
  getPolicySection(platform: string, section: string): Promise<PlatformPolicy | null>;
}

export class MockPolicyRepository implements PolicyRepository {
  private policies: PlatformPolicy[] = [
    {
      id: 'pol-qb-merchant-delay',
      platform: 'QuickBite',
      section: 'Merchant Delay Policy',
      title: 'Merchant Handover Delays',
      content:
        'When order preparation exceeds 5 minutes at store, delivery partner SLA must automatically adjust or be waived upon evidence submission.',
      lastUpdated: '2026-01-15',
    },
  ];

  async searchPolicy(platform: string, _query: string): Promise<PlatformPolicy[]> {
    return this.policies.filter((p) => p.platform.toLowerCase() === platform.toLowerCase());
  }

  async getPolicySection(platform: string, section: string): Promise<PlatformPolicy | null> {
    return (
      this.policies.find(
        (p) => p.platform.toLowerCase() === platform.toLowerCase() && p.section === section
      ) || null
    );
  }
}

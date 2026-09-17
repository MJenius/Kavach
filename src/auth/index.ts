import { Worker } from '../domain/index.ts';

/**
 * ============================================================================
 * Auth Provider Interface (Person 3 - feature/cloud-platform)
 * ============================================================================
 * Decouples authentication logic from UI and AWS Cognito.
 * ============================================================================
 */

export interface AuthSession {
  workerId: string;
  token: string;
  expiresAt: number;
}

export interface AuthProvider {
  getCurrentWorker(): Promise<Worker | null>;
  signInWithPhone(phoneNumber: string): Promise<{ session: AuthSession }>;
  signOut(): Promise<void>;
}

export class MockAuthProvider implements AuthProvider {
  async getCurrentWorker(): Promise<Worker | null> {
    return {
      id: 'worker-vikram-01',
      name: 'Vikram Sharma',
      preferredLanguage: 'hi',
      platforms: ['QuickBite', 'FlashDrop'],
    };
  }

  async signInWithPhone(phoneNumber: string): Promise<{ session: AuthSession }> {
    return {
      session: {
        workerId: 'worker-vikram-01',
        token: `mock-token-${phoneNumber}-${Date.now()}`,
        expiresAt: Date.now() + 3600000,
      },
    };
  }

  async signOut(): Promise<void> {
    // No-op in mock
  }
}

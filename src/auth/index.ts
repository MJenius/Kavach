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

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

export class CognitoAuthProvider implements AuthProvider {
  private client: CognitoIdentityProviderClient;
  private clientId: string;

  constructor(
    clientId = process.env.COGNITO_CLIENT_ID || 'kavach-client-id',
    region = process.env.AWS_REGION || 'ap-south-1'
  ) {
    this.clientId = clientId;
    this.client = new CognitoIdentityProviderClient({ region });
  }

  async getCurrentWorker(): Promise<Worker | null> {
    return {
      id: 'worker-vikram-01',
      name: 'Vikram Sharma',
      preferredLanguage: 'hi',
      platforms: ['QuickBite', 'FlashDrop'],
    };
  }

  async signInWithPhone(phoneNumber: string): Promise<{ session: AuthSession }> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: phoneNumber,
        },
      });
      const res = await this.client.send(command);
      return {
        session: {
          workerId: 'worker-vikram-01',
          token: res.AuthenticationResult?.IdToken || `cognito-token-${Date.now()}`,
          expiresAt: Date.now() + (res.AuthenticationResult?.ExpiresIn || 3600) * 1000,
        },
      };
    } catch {
      return new MockAuthProvider().signInWithPhone(phoneNumber);
    }
  }

  async signOut(): Promise<void> {
    // Sign out from local session
  }
}

export function getAuthProvider(): AuthProvider {
  if (process.env.MOCK_AUTH === 'false' && process.env.COGNITO_CLIENT_ID) {
    return new CognitoAuthProvider();
  }
  return new MockAuthProvider();
}


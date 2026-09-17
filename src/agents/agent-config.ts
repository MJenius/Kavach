import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

export interface AgentRuntimeConfig {
  useBedrock: boolean;
  bedrockClient: BedrockRuntimeClient | null;
  modelId: string;
  region: string;
  maxTokens: number;
  temperature: number;
}

let cachedConfig: AgentRuntimeConfig | null = null;

export function getAgentRuntimeConfig(): AgentRuntimeConfig {
  if (cachedConfig) return cachedConfig;

  const useBedrock = process.env.MOCK_AI === 'false';
  const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
  const region = process.env.AWS_REGION || 'ap-south-1';

  let bedrockClient: BedrockRuntimeClient | null = null;
  if (useBedrock) {
    bedrockClient = new BedrockRuntimeClient({ region });
  }

  cachedConfig = {
    useBedrock,
    bedrockClient,
    modelId,
    region,
    maxTokens: 4096,
    temperature: 0.1,
  };
  return cachedConfig;
}

export function resetAgentRuntimeConfig(): void {
  cachedConfig = null;
}

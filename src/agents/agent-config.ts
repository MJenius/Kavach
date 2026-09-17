export interface AgentRuntimeConfig {
  useBedrock: boolean;
  bedrockClient: unknown | null;
  modelId: string;
  region: string;
  maxTokens: number;
  temperature: number;
}

let cachedConfig: AgentRuntimeConfig | null = null;

export function getAgentRuntimeConfig(): AgentRuntimeConfig {
  if (cachedConfig) return cachedConfig;

  const useBedrock = process.env.MOCK_AI === 'false';
  const modelId = process.env.BEDROCK_MODEL_ID || 'openai.gpt-oss-120b';
  const region = process.env.AWS_REGION || 'ap-south-1';

  let bedrockClient: unknown | null = null;

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

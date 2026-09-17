import { Agent } from './index.ts';
import { PolicyAnalysisResult } from '../ai/types.ts';
import { validatePolicyAnalysis } from '../ai/structured-output.ts';
import { BedrockAIService } from '../ai/bedrock.ts';
import { POLICY_SYSTEM_PROMPT, generatePolicyUserPrompt } from '../prompts/policy.prompt.ts';
import { getRelevantPolicy } from './tools/index.ts';
import { getAgentRuntimeConfig } from './agent-config.ts';

export interface PolicyAgentInput {
  platform: string;
  issueType: string;
}

export class PolicyAgent implements Agent<PolicyAgentInput, PolicyAnalysisResult> {
  readonly name = 'PolicyAgent';
  readonly description = 'Retrieves and explains platform terms and SLAs without rendering legal advice or inventing citations.';

  private bedrock: BedrockAIService | null;

  constructor(bedrock?: BedrockAIService | null) {
    const config = getAgentRuntimeConfig();
    this.bedrock = bedrock ?? (config.useBedrock ? new BedrockAIService() : null);
  }

  async run(input: PolicyAgentInput): Promise<PolicyAnalysisResult> {
    const policyResult = await getRelevantPolicy(input.platform, input.issueType);

    if (policyResult.sourceUnavailable || !policyResult.policy) {
      const rawFallback: PolicyAnalysisResult = {
        platform: input.platform,
        issueType: input.issueType,
        isApplicable: false,
        sourceUnavailable: true,
        interpretation: `No canonical policy found for ${input.platform} regarding ${input.issueType}. Kavach AI does not fabricate policy citations.`,
        uncertaintyNotes: 'Policy document is not in the active repository.',
        isLegalAdvice: false,
        confidence: 0.8,
      };
      const val = validatePolicyAnalysis(rawFallback);
      return val.data || rawFallback;
    }

    // If Bedrock is available, use AI for policy explanation
    if (this.bedrock) {
      try {
        const userPrompt = generatePolicyUserPrompt({
          platform: input.platform,
          issueType: input.issueType,
          availablePolicies: [policyResult.policy as unknown as Record<string, unknown>],
        });

        const result = await this.bedrock.generateStructured<PolicyAnalysisResult>({
          prompt: userPrompt,
          systemPrompt: POLICY_SYSTEM_PROMPT,
          targetSchemaName: 'PolicyAnalysisResult',
          validate: validatePolicyAnalysis,
        });

        if (result.success && result.data) {
          // Force isLegalAdvice to false — never trust LLM for this
          result.data.isLegalAdvice = false;
          // Preserve the actual policy source
          result.data.relevantRule = {
            policyName: policyResult.policy.policyName,
            clauseReference: policyResult.policy.clauseReference,
            summaryText: policyResult.policy.summaryText,
            sourceUri: policyResult.policy.sourceUri,
          };
          result.data.sourceUnavailable = false;
          return result.data;
        }
      } catch {
        // Fall through to deterministic path
      }
    }

    // Deterministic path
    const rawResult: PolicyAnalysisResult = {
      platform: input.platform,
      issueType: input.issueType,
      relevantRule: {
        policyName: policyResult.policy.policyName,
        clauseReference: policyResult.policy.clauseReference,
        summaryText: policyResult.policy.summaryText,
        sourceUri: policyResult.policy.sourceUri,
      },
      isApplicable: true,
      sourceUnavailable: false,
      interpretation: `Under ${policyResult.policy.clauseReference}, delivery partner SLAs must be automatically extended or penalties waived when restaurant/merchant queue times exceed 5 minutes.`,
      uncertaintyNotes: 'Applicability is subject to worker evidence showing merchant arrival timestamp.',
      isLegalAdvice: false,
      confidence: 0.95,
    };

    const validated = validatePolicyAnalysis(rawResult);
    if (!validated.success || !validated.data) {
      throw new Error(`Policy analysis validation failed: ${validated.error}`);
    }

    return validated.data;
  }
}

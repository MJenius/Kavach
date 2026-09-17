import OpenAI from 'openai';
import {
  TextGenerationRequest,
  TextGenerationResponse,
  DocumentExtractionRequest,
  DocumentExtractionResult,
  StructuredGenerationRequest,
  AIServiceConfig,
} from './types.ts';
import { parseSafeJson, ValidationResult, validateDocumentExtraction } from './structured-output.ts';
import {
  DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
  generateDocumentExtractionPrompt,
} from '../prompts/document-extraction.prompt.ts';

export class BedrockMantleAIServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'BedrockMantleAIServiceError';
  }
}

/**
 * BedrockMantleAIService connects to AWS Bedrock Mantle using the OpenAI-compatible API.
 * Uses BEDROCK_MANTLE_BASE_URL (default: https://bedrock-mantle.ap-south-1.api.aws/v1)
 * and BEDROCK_MODEL_ID (default: openai.gpt-oss-120b).
 */
export class BedrockMantleAIService {
  readonly modelId: string;
  readonly baseURL: string;
  readonly maxTokens: number;
  readonly temperature: number;
  private client: OpenAI;

  constructor(config?: AIServiceConfig & { baseURL?: string; apiKey?: string; client?: OpenAI }) {
    this.modelId =
      config?.modelId ||
      process.env.BEDROCK_MODEL_ID ||
      'openai.gpt-oss-120b';
    this.baseURL =
      config?.baseURL ||
      process.env.BEDROCK_MANTLE_BASE_URL ||
      'https://bedrock-mantle.ap-south-1.api.aws/v1';
    this.maxTokens = config?.maxTokens || 4096;
    this.temperature = config?.temperature ?? 0.1;

    if (config?.client) {
      this.client = config.client;
    } else {
      const apiKey =
        config?.apiKey ||
        process.env.BEDROCK_API_KEY ||
        process.env.BEDROCK_MANTLE_API_KEY ||
        process.env.AWS_BEARER_TOKEN_BEDROCK ||
        process.env.OPENAI_API_KEY ||
        'bedrock-mantle-session';

      this.client = new OpenAI({
        baseURL: this.baseURL,
        apiKey,
        dangerouslyAllowBrowser: false,
      });
    }
  }

  async generateText(request: TextGenerationRequest | string): Promise<TextGenerationResponse> {
    const prompt = typeof request === 'string' ? request : request.prompt;
    const systemPrompt = typeof request === 'string' ? undefined : request.systemPrompt;
    const maxTokens = (typeof request === 'object' && request.maxTokens) || this.maxTokens;
    const temperature =
      typeof request === 'object' && request.temperature !== undefined
        ? request.temperature
        : this.temperature;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.client.chat.completions.create({
        model: this.modelId,
        messages,
        max_tokens: maxTokens,
        temperature,
      });

      const text = response.choices?.[0]?.message?.content || '';
      return {
        text,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BedrockMantleAIServiceError(
        `Bedrock Mantle invocation failed for model ${this.modelId} at ${this.baseURL}: ${message}`,
        err
      );
    }
  }

  async generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<ValidationResult<T>> {
    try {
      const resp = await this.generateText({
        prompt: `${request.prompt}\n\nReturn strictly valid JSON conforming to ${request.targetSchemaName}. Do not include commentary outside the JSON block.`,
        systemPrompt: request.systemPrompt,
      });

      if (!request.validate) {
        try {
          const parsed = JSON.parse(resp.text);
          return { success: true, data: parsed as T };
        } catch (e) {
          return { success: false, error: `Failed to parse raw JSON: ${String(e)}` };
        }
      }

      const result = parseSafeJson(resp.text, request.validate);
      if (!result.success) {
        // Retry once on parse/validation failure
        const retryResp = await this.generateText({
          prompt: `${request.prompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY valid JSON conforming to ${request.targetSchemaName}. No markdown, no commentary.`,
          systemPrompt: request.systemPrompt,
        });
        return parseSafeJson(retryResp.text, request.validate);
      }
      return result;
    } catch (err) {
      return {
        success: false,
        error: `Bedrock Mantle structured generation failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async extractDocument(request: DocumentExtractionRequest): Promise<DocumentExtractionResult> {
    const prompt = generateDocumentExtractionPrompt(request.documentUri);

    try {
      const resp = await this.generateText({
        prompt,
        systemPrompt: DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
        temperature: 0.0,
      });

      const parsed = parseSafeJson(resp.text, validateDocumentExtraction);
      if (!parsed.success || !parsed.data) {
        throw new BedrockMantleAIServiceError(`Document extraction validation failed: ${parsed.error}`);
      }
      return parsed.data;
    } catch (err) {
      if (err instanceof BedrockMantleAIServiceError) throw err;
      throw new BedrockMantleAIServiceError(
        `Bedrock Mantle document extraction failed: ${err instanceof Error ? err.message : String(err)}`,
        err
      );
    }
  }
}

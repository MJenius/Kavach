import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
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

export class BedrockAIServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'BedrockAIServiceError';
  }
}

/**
 * BedrockAIService connects to AWS Bedrock Runtime using the AWS credential provider chain.
 * Never hardcodes credentials. Uses InvokeModelCommand with the Anthropic Messages API format.
 */
export class BedrockAIService {
  readonly modelId: string;
  readonly region: string;
  readonly maxTokens: number;
  readonly temperature: number;
  private client: BedrockRuntimeClient;

  constructor(config?: AIServiceConfig) {
    this.modelId = config?.modelId || process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    this.region = config?.region || process.env.AWS_REGION || 'ap-south-1';
    this.maxTokens = config?.maxTokens || 4096;
    this.temperature = config?.temperature ?? 0.1;
    this.client = config?.client || new BedrockRuntimeClient({ region: this.region });
  }

  async generateText(request: TextGenerationRequest | string): Promise<TextGenerationResponse> {
    const prompt = typeof request === 'string' ? request : request.prompt;
    const systemPrompt = typeof request === 'string' ? undefined : request.systemPrompt;
    const maxTokens = (typeof request === 'object' && request.maxTokens) || this.maxTokens;
    const temperature = (typeof request === 'object' && request.temperature !== undefined) ? request.temperature : this.temperature;

    const body: Record<string, unknown> = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    };
    if (systemPrompt) {
      body.system = systemPrompt;
    }

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(body),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      const text = responseBody.content
        ?.filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('') || '';

      return {
        text,
        usage: responseBody.usage ? {
          promptTokens: responseBody.usage.input_tokens ?? 0,
          completionTokens: responseBody.usage.output_tokens ?? 0,
          totalTokens: (responseBody.usage.input_tokens ?? 0) + (responseBody.usage.output_tokens ?? 0),
        } : undefined,
      };
    } catch (err) {
      if (err instanceof BedrockAIServiceError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      // Check for common AWS errors
      if (message.includes('Could not load credentials') || message.includes('CredentialsProviderError')) {
        throw new BedrockAIServiceError(
          `model ${this.modelId} requires AWS credentials in region ${this.region}. Set MOCK_AI=true for local development.`,
          err
        );
      }
      throw new BedrockAIServiceError(`Bedrock invocation failed: ${message}`, err);
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
        error: `Bedrock structured generation failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async extractDocument(request: DocumentExtractionRequest): Promise<DocumentExtractionResult> {
    const userContent: Array<Record<string, unknown>> = [];

    if (request.documentBase64 && request.mimeType) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: request.mimeType,
          data: request.documentBase64,
        },
      });
    }

    userContent.push({
      type: 'text',
      text: generateDocumentExtractionPrompt(request.documentUri),
    });

    const body = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: this.maxTokens,
      temperature: 0.0,
      system: DOCUMENT_EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    };

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(body),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const text = responseBody.content
        ?.filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('') || '{}';

      const parsed = parseSafeJson(text, validateDocumentExtraction);
      if (!parsed.success || !parsed.data) {
        throw new BedrockAIServiceError(`Document extraction validation failed: ${parsed.error}`);
      }
      return parsed.data;
    } catch (err) {
      if (err instanceof BedrockAIServiceError) throw err;
      throw new BedrockAIServiceError(
        `Bedrock document extraction failed: ${err instanceof Error ? err.message : String(err)}`,
        err
      );
    }
  }
}

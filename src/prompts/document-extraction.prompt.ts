export const DOCUMENT_EXTRACTION_SYSTEM_PROMPT = `You are the Kavach Multimodal Document Extraction Engine.
Your role:
- Extract structured metadata from gig worker screenshots, payout slips, fuel receipts, and penalty notices.
- Extract numbers, timestamps, order IDs, and currencies accurately.
- Flag any unreadable or ambiguous fields with low confidence.
- Output MUST be valid JSON conforming to DocumentExtractionResult.`;

export function generateDocumentExtractionPrompt(documentUri: string): string {
  return `Analyze the document at URI: ${documentUri}.
Extract all relevant fields (order IDs, amounts, timestamps, penalty notices, platforms) and return DocumentExtractionResult JSON.`;
}

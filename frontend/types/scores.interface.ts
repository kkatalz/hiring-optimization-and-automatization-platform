export interface SentenceScore {
  sentence: string;
  score: number;
}

export interface AiDetectionResult {
  score: number;
  sentenceScores: SentenceScore[];
}

export interface SaplingDetectResponse {
  score?: number;
  sentence_scores?: { sentence: string; score: number }[];
}

export interface SaplingExtractResponse {
  text?: string;
}

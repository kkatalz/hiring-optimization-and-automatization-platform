export interface SentenceScore {
  sentence: string;
  score: number;
}

export interface AiDetectionResult {
  score: number;
  sentenceScores: SentenceScore[];
}

import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AiDetectionResult,
  SaplingDetectResponse,
  SaplingExtractResponse,
  SentenceScore,
} from './types/scores.interface';

const AI_DETECT_TIMEOUT_MS = 5000;
const EXTRACT_TIMEOUT_MS = 15000;

@Injectable()
export class SaplingService {
  private readonly logger = new Logger(SaplingService.name);

  private get apiKey(): string | undefined {
    return process.env.SAPLING_API_KEY;
  }

  async detectAiContent(
    text: string | undefined,
  ): Promise<AiDetectionResult | null> {
    // Skip silently when there's nothing useful to analyze.
    if (!text || text.length < 50) {
      this.logger.warn(
        `Skipping AI detection: text missing or too short (length: ${text?.length ?? 0})`,
      );
      return null;
    }

    if (!this.apiKey) {
      this.logger.warn('SAPLING_API_KEY is not set, skipping AI detection');
      throw new ServiceUnavailableException(
        'Text extraction service is unavailable. Sapling api key is missing.',
      );
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        AI_DETECT_TIMEOUT_MS,
      );

      try {
        const response = await fetch('https://api.sapling.ai/api/v1/aidetect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: this.apiKey, text, sent_scores: true }),
          signal: controller.signal,
        });

        if (!response.ok) {
          this.logger.warn(`Sapling API returned status ${response.status}`);
          return null;
        }

        const data = (await response.json()) as SaplingDetectResponse;
        const rawScore = data.score;

        if (rawScore == null) {
          this.logger.warn('Sapling response missing score');
          return null;
        }

        const score = this.roundPercent(rawScore);

        const sentenceScores: SentenceScore[] = (
          data.sentence_scores ?? []
        ).map((entry) => ({
          sentence: entry.sentence,
          score: this.roundPercent(entry.score),
        }));

        return { score, sentenceScores };
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      this.logger.warn(
        `Sapling API call failed: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  /** Convert a 0–1 probability into a 0–100 percentage rounded to 2 decimals. */
  private roundPercent(value: number): number {
    return Math.round(value * 10000) / 100;
  }

  async extractTextFromResumeDependingOnExtension(
    file: Express.Multer.File,
    extension: string,
  ): Promise<string | null> {
    let extractedText: string | null = null;

    if (extension === 'pdf') {
      extractedText = await this.extractTextFromPdf(
        file.buffer,
        file.originalname,
      );
    } else if (extension === 'docx') {
      extractedText = await this.extractTextFromDocx(
        file.buffer,
        file.originalname,
      );
    } else {
      throw new BadRequestException(
        'Unsupported file type. Only PDF and DOCX are allowed.',
      );
    }

    return extractedText;
  }

  async extractTextFromPdf(
    buffer: Buffer,
    filename: string,
  ): Promise<string | null> {
    return this.extractText(buffer, filename, 'pdf_to_text');
  }

  async extractTextFromDocx(
    buffer: Buffer,
    filename: string,
  ): Promise<string | null> {
    return this.extractText(buffer, filename, 'docx_to_text');
  }

  private async extractText(
    buffer: Buffer,
    filename: string,
    endpoint: 'pdf_to_text' | 'docx_to_text',
  ): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn('SAPLING_API_KEY is not set, skipping text extraction');
      throw new ServiceUnavailableException(
        'Text extraction service is unavailable. Sapling api key is missing.',
      );
    }

    try {
      const formData = new FormData();

      formData.append('file', new Blob([new Uint8Array(buffer)]), filename);

      const jsonParams = JSON.stringify({
        key: this.apiKey,
      });

      formData.append(
        'jsonParams',
        new Blob([jsonParams], { type: 'application/json' }),
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);

      try {
        const response = await fetch(
          `https://api.sapling.ai/api/v1/ingest/${endpoint}`,
          {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          this.logger.warn(
            `Sapling ${endpoint} API returned status ${response.status}: ${text}`,
          );
          return null;
        }

        const data = (await response.json()) as SaplingExtractResponse;
        return data.text ?? null;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      this.logger.warn(
        `Sapling ${endpoint} call failed: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }
}

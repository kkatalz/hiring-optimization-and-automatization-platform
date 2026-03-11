import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AiDetectionResult, SentenceScore } from './types/scores.interface';

@Injectable()
export class SaplingService {
  private readonly logger = new Logger(SaplingService.name);
  private readonly apiKey = process.env.SAPLING_API_KEY;

  async detectAiContent(
    text: string | undefined,
  ): Promise<AiDetectionResult | null> {
    if (!text) {
      this.logger.warn('No text provided for AI detection');
      return null;
    }

    if (!this.apiKey) {
      this.logger.warn('SAPLING_API_KEY is not set, skipping AI detection');
      return null;
    }

    if (!text || text.length < 50) {
      this.logger.warn(
        `Text is too short for AI detection (length: ${text?.length ?? 0})`,
      );
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

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

        const data = await response.json();
        const rawScore = data?.score;

        if (rawScore == null) {
          this.logger.warn('Sapling response missing score');
          return null;
        }

        const score = Math.round(rawScore * 100 * 100) / 100;

        const sentenceScores: SentenceScore[] = (
          data.sentence_scores ?? []
        ).map((entry: { sentence: string; score: number }) => ({
          sentence: entry.sentence,
          score: Math.round(entry.score * 100 * 100) / 100,
        }));

        return { score, sentenceScores };
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      this.logger.warn(`Sapling API call failed: ${error.message}`);
      return null;
    }
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
      return null;
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
      const timeout = setTimeout(() => controller.abort(), 15000);

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

        const data = await response.json();
        return data?.text ?? null;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      this.logger.warn(`Sapling ${endpoint} call failed: ${error.message}`);
      return null;
    }
  }
}

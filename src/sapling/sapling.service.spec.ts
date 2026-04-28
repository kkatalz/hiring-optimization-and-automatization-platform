import { expect } from 'chai';
import * as sinon from 'sinon';
import { SaplingService } from './sapling.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('SaplingService', () => {
  let service: SaplingService;

  beforeEach(() => {
    service = new SaplingService();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be defined', () => {
    expect(!!service).to.equal(true);
  });

  describe('detectAiContent', () => {
    it('should throw ServiceUnavailableException when SAPLING_API_KEY is not set', async () => {
      const original = process.env.SAPLING_API_KEY;
      delete process.env.SAPLING_API_KEY;

      const freshService = new SaplingService();

      try {
        await freshService.detectAiContent(
          'This is a long enough text to pass the minimum character threshold for AI detection.',
        );

        expect.fail(
          'Expected detectAiContent to throw an error when SAPLING_API_KEY is not set',
        );
      } catch (error) {
        if (error.message?.includes('Expected detectAiContent')) throw error;
        expect(error).to.be.instanceOf(ServiceUnavailableException);
        expect(error.message).to.equal(
          'Text extraction service is unavailable. Sapling api key is missing.',
        );
      } finally {
        process.env.SAPLING_API_KEY = original;
      }
    });

    it('should return null for text shorter than 50 characters', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const result = await freshService.detectAiContent('Short text');
      expect(result).to.equal(null);
    });

    it('should return null for empty text', async () => {
      const freshService = new SaplingService();

      const result = await freshService.detectAiContent('');
      expect(result).to.equal(null);
    });

    it('should return null for undefined text', async () => {
      const freshService = new SaplingService();

      const result = await freshService.detectAiContent(undefined);
      expect(result).to.equal(null);
    });

    it('should send correct request format to Sapling API', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({
          score: 0.85,
          sentence_scores: [{ sentence: 'Hello world.', score: 0.9 }],
        }),
      };

      const fetchStub = sinon
        .stub(global, 'fetch')
        .resolves(mockResponse as any);

      const text =
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.';

      await freshService.detectAiContent(text);

      const [url, options] = fetchStub.firstCall.args;
      expect(url).to.equal('https://api.sapling.ai/api/v1/aidetect');
      expect(options!.method).to.equal('POST');

      const body = JSON.parse(options!.body as string);
      expect(body).to.have.property('key', 'test-key');
      expect(body).to.have.property('text', text);
      expect(body).to.have.property('sent_scores', true);
      expect(body).to.not.have.property('document');

      expect(options!.headers).to.deep.equal({
        'Content-Type': 'application/json',
      });
    });

    it('should return AI score and sentence scores on successful API response', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({
          score: 0.85,
          sentence_scores: [
            { sentence: 'First sentence.', score: 0.9 },
            { sentence: 'Second sentence.', score: 0.7 },
          ],
        }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result).to.not.be.null;
      expect(result!.score).to.equal(85);
      expect(result!.sentenceScores).to.deep.equal([
        { sentence: 'First sentence.', score: 90 },
        { sentence: 'Second sentence.', score: 70 },
      ]);
    });

    it('should return null when API returns non-ok status', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: false,
        status: 500,
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result).to.equal(null);
    });

    it('should return null when fetch throws (e.g., timeout)', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      sinon.stub(global, 'fetch').rejects(new Error('AbortError'));

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result).to.equal(null);
    });

    it('should round the score to 2 decimal places', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({
          score: 0.8567,
          sentence_scores: [],
        }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result!.score).to.equal(85.67);
    });

    it('should handle empty sentence_scores array', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({
          score: 0.5,
          sentence_scores: [],
        }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result!.score).to.equal(50);
      expect(result!.sentenceScores).to.deep.equal([]);
    });

    it('should handle missing sentence_scores in response', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({
          score: 0.5,
        }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.detectAiContent(
        'This is a sufficiently long text that exceeds the fifty character minimum threshold for AI detection analysis.',
      );

      expect(result!.score).to.equal(50);
      expect(result!.sentenceScores).to.deep.equal([]);
    });
  });

  describe('extractTextFromPdf', () => {
    it('should throw ServiceUnavailableException when SAPLING_API_KEY is not set', async () => {
      const original = process.env.SAPLING_API_KEY;
      delete process.env.SAPLING_API_KEY;

      const freshService = new SaplingService();

      try {
        await freshService.extractTextFromPdf(
          Buffer.from('fake-pdf'),
          'test.pdf',
        );

        expect.fail(
          'Expected extractTextFromPdf to throw an error when SAPLING_API_KEY is not set',
        );
      } catch (error) {
        if (error.message?.includes('Expected extractTextFromPdf')) throw error;
        expect(error).to.be.instanceOf(ServiceUnavailableException);
        expect(error.message).to.equal(
          'Text extraction service is unavailable. Sapling api key is missing.',
        );
      } finally {
        process.env.SAPLING_API_KEY = original;
      }
    });

    it('should return extracted text on success', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({ text: 'Extracted PDF text content' }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.extractTextFromPdf(
        Buffer.from('fake-pdf'),
        'test.pdf',
      );

      expect(result).to.equal('Extracted PDF text content');
    });

    it('should return null on API error', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      sinon.stub(global, 'fetch').resolves({ ok: false, status: 500 } as any);

      const result = await freshService.extractTextFromPdf(
        Buffer.from('fake-pdf'),
        'test.pdf',
      );

      expect(result).to.equal(null);
    });
  });

  describe('extractTextFromDocx', () => {
    it('should throw ServiceUnavailableException when SAPLING_API_KEY is not set', async () => {
      const original = process.env.SAPLING_API_KEY;
      delete process.env.SAPLING_API_KEY;

      const freshService = new SaplingService();

      try {
        await freshService.extractTextFromDocx(
          Buffer.from('fake-docx'),
          'test.docx',
        );

        expect.fail(
          'Expected extractTextFromDocx to throw an error when SAPLING_API_KEY is not set',
        );
      } catch (error) {
        if (error.message?.includes('Expected extractTextFromDocx'))
          throw error;
        expect(error).to.be.instanceOf(ServiceUnavailableException);
        expect(error.message).to.equal(
          'Text extraction service is unavailable. Sapling api key is missing.',
        );
      } finally {
        process.env.SAPLING_API_KEY = original;
      }
    });

    it('should return extracted text on success', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({ text: 'Extracted DOCX text content' }),
      };

      sinon.stub(global, 'fetch').resolves(mockResponse as any);

      const result = await freshService.extractTextFromDocx(
        Buffer.from('fake-docx'),
        'test.docx',
      );

      expect(result).to.equal('Extracted DOCX text content');
    });

    it('should return null on fetch error', async () => {
      const freshService = new SaplingService();

      sinon.stub(process, 'env').value({
        ...process.env,
        SAPLING_API_KEY: 'test-key',
      });

      sinon.stub(global, 'fetch').rejects(new Error('Network error'));

      const result = await freshService.extractTextFromDocx(
        Buffer.from('fake-docx'),
        'test.docx',
      );

      expect(result).to.equal(null);
    });
  });
});

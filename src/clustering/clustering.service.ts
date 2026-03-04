import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VacancySubmission } from '../entities/vacancySubmission';
import { Vacancy } from '../entities/vacancy';
import { QuestionType } from '../entities/question.enum';
import { VacancyQuestionDetailedDto } from '../vacancy/dto/vacancyQuestionDetailed.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from '../vacancySubmission/map/vacancySubmission.map';
import { VacancyService } from '../vacancy/vacancy.service';
import mlKmeans from 'ml-kmeans';
import { SalaryRange } from './types/salaryRange.interface';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';

@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  constructor(
    @InjectRepository(VacancySubmission)
    private readonly submissionRepository: Repository<VacancySubmission>,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    private readonly vacancyService: VacancyService,
    private readonly vacancySubmissionService: VacancySubmissionService,
  ) {}

  /** Builds a feature vector for a given vacancy submission */
  buildFeatureVector(
    submission: VacancySubmission,
    allVacancyTags: string[],
    salaryRange: SalaryRange,
    vacancyQuestions: VacancyQuestionDetailedDto[],
  ): number[] {
    const vector: number[] = [];

    const answerMap = new Map(
      (submission.answers || []).map((a) => [a.questionId, a.value]),
    );

    // Process questions (skip text type)
    for (const vq of vacancyQuestions) {
      if (vq.type === QuestionType.text) continue;

      const weight = vq.priority > 0 ? 1 / vq.priority : 1;
      const answer = answerMap.get(vq.questionId);

      if (vq.type === QuestionType.boolean) {
        const value = answer != null ? (answer === 'true' ? 1 : 0) : 0;
        vector.push(value * weight);
      } else if (vq.type === QuestionType.dropdown) {
        const options = vq.answerOptions || [];

        if (options.length <= 1) {
          const value = answer != null ? 1 : 0.5;
          vector.push(value * weight);
        } else {
          // If there are multiple options (2 and more)
          const index = answer != null ? options.indexOf(answer) : -1;
          const value = index >= 0 ? index / (options.length - 1) : 0.5;
          vector.push(value * weight);
        }
      }
    }

    // Salary — min-max normalization (weight = 1)
    const salary =
      submission.expectedSalary != null
        ? Number(submission.expectedSalary)
        : null;

    if (salaryRange.max === salaryRange.min) {
      // Avoid division by zero if all candidates want the same salary
      vector.push(salary != null ? 0.5 : 0);
    } else {
      const normalized =
        salary != null
          ? (salary - salaryRange.min) / (salaryRange.max - salaryRange.min)
          : 0;
      vector.push(normalized);
    }

    // Tags — one-hot encoding (weight = 1 per tag)
    for (const tag of allVacancyTags) {
      vector.push((submission.tags || []).includes(tag) ? 1 : 0);
    }

    return vector;
  }

  async clusterSubmissions(vacancyId: string): Promise<void> {
    const vacancy = await this.vacancyService.findVacancyById(vacancyId);

    const submissions =
      await this.vacancySubmissionService.findSubmissionAnswersByVacancyId(
        vacancyId,
      );

    if (submissions.length < 2) return;

    const vacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancyId);

    const allVacancyTags = vacancy.tags || [];

    const salaryRange = this.calculateSalaryRange(submissions);

    const vectors = submissions.map((s) =>
      this.buildFeatureVector(s, allVacancyTags, salaryRange, vacancyQuestions),
    );

    // If vectors are empty (no features), skip clustering
    if (vectors[0].length === 0) return;

    const numberOfSubmissions = submissions.length;

    // Ensures that we have at least 2 clusters
    const numberOfClusters = Math.max(
      2,
      Math.ceil(Math.sqrt(numberOfSubmissions / 2)),
    );

    const result = mlKmeans.kmeans(vectors, numberOfClusters, { seed: 42 });

    for (let i = 0; i < submissions.length; i++) {
      submissions[i].clusterId = result.clusters[i];
    }

    await this.submissionRepository.save(submissions);
    await this.vacancyRepository.update(
      { id: vacancyId },
      { needsReclustering: false },
    );
  }

  async findSimilar(submissionId: string): Promise<VacancySubmissionDto[]> {
    const submission =
      await this.vacancySubmissionService.findOneById(submissionId);

    if (submission.clusterId == null) {
      throw new HttpException(
        'Submission has not been clustered yet. Run clustering first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const similar = await this.vacancySubmissionService.findSimilarSubmissions(
      submission.vacancyId,
      submission.clusterId,
    );

    return similar
      .filter((s) => s.id !== submissionId)
      .map(vacancySubmToVacancySubmDto);
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleClusteringCron(): Promise<void> {
    this.logger.log('Running scheduled clustering for stale vacancies...');

    const vacancies = await this.vacancyRepository.find({
      where: { needsReclustering: true },
    });

    if (vacancies.length === 0) {
      this.logger.log('No vacancies need reclustering. Skipping.');
      return;
    }

    for (const vacancy of vacancies) {
      try {
        await this.clusterSubmissions(vacancy.id);
      } catch (error) {
        this.logger.error(
          `Failed to cluster vacancy ${vacancy.id}: ${error.message}`,
        );
      }
    }

    this.logger.log('Scheduled clustering complete.');
  }

  /* Calculate salary range from all submissions */
  private calculateSalaryRange(submissions: VacancySubmission[]): SalaryRange {
    const salaries = submissions
      .map((s) => (s.expectedSalary != null ? Number(s.expectedSalary) : null))
      .filter((s): s is number => s != null);

    const salaryRange: SalaryRange = {
      min: salaries.length > 0 ? Math.min(...salaries) : 0,
      max: salaries.length > 0 ? Math.max(...salaries) : 0,
    };
    return salaryRange;
  }
}

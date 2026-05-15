import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VacancySubmission } from '../entities/vacancySubmission';
import { Vacancy } from '../entities/vacancy';
import { QuestionType } from '../entities/question.enum';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { VacancyQuestionDetailedDto } from '../vacancy/dto/vacancyQuestionDetailed.dto';
import { VacancySubmissionDto } from '../vacancySubmission/dto/vacancySubmission.dto';
import { vacancySubmToVacancySubmDto } from '../vacancySubmission/map/vacancySubmission.map';
import { VacancyService } from '../vacancy/vacancy.service';
import mlKmeans from 'ml-kmeans';
import { SalaryRange } from '../types/salaryRange.interface';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import {
  LanguageProficiency,
  LanguageLevelRank,
} from '../entities/hiring.enum';

const MIN_CLUSTERS = 2;

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

    private readonly dataSource: DataSource,
  ) {}

  /** Builds a feature vector for a given vacancy submission based on order:
   * [question_features..., salary, tag_features..., experience, language_features...]
   *
   * Example — a vacancy with:
   *   - 1 boolean question (priority 2, so weight = 1/2 = 0.5)
   *   - 1 dropdown question with options ['Bachelor', 'Master'] (priority 1, weight = 1)
   *   - tags ['React', 'Node']
   *   - requiredYearsOfExperience = 4
   *   - language requirement [{ code: 'en', level: 'B2' }]
   *   - salaryRange { min: 40000, max: 80000 }
   *
   * and a submission with:
   *   - boolean answer = 'true'
   *   - dropdown answer = ['Master']
   *   - expectedSalary = 60000
   *   - tags = ['React']
   *   - candidateProfile: { yearsOfExperience: 2, languages: [{ en, C1 }] }
   *
   * produces:
   *   [0.5,  0, 1,  0.5,  1, 0,  0.5,  1]
   *    bool  Bch Mst sal  R  N  exp   en
   */
  buildFeatureVector(
    submission: VacancySubmission,
    allVacancyTags: string[],
    salaryRange: SalaryRange,
    vacancyQuestions: VacancyQuestionDetailedDto[],
    vacancyLanguageRequirements?: LanguageProficiency[],
    vacancyRequiredYearsOfExperience?: number,
  ): number[] {
    const vector: number[] = [];

    const answerMap = new Map<string, string | string[]>(
      (submission.answers || []).map((a) => [a.questionId, a.value]),
    );

    // Process questions (skip text type)
    for (const vq of vacancyQuestions) {
      if (vq.type === QuestionType.text) continue;

      // Safety check - this should not happen due to validation (priority defaults to 1
      // and should be >= 1), but we want to avoid breaking the entire score if it does
      const weight = vq.priority > 0 ? 1 / vq.priority : 1;
      const answer = answerMap.get(vq.questionId);

      if (vq.type === QuestionType.boolean) {
        const value = answer != null ? (answer === 'true' ? 1 : 0) : 0;
        vector.push(value * weight);
      } else if (vq.type === QuestionType.dropdown) {
        const options = vq.answerOptions || [];

        // Wrap answer into array if it's a single string. Return [] if no answer provided.
        const selected: string[] = Array.isArray(answer)
          ? answer
          : answer
            ? [answer]
            : [];
        for (const opt of options) {
          vector.push(selected.includes(opt) ? 1 * weight : 0);
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

    // Experience — ratio encoding (weight = 1)
    if (
      vacancyRequiredYearsOfExperience != null &&
      vacancyRequiredYearsOfExperience > 0
    ) {
      const candidateYears =
        submission.candidateProfile?.yearsOfExperience ?? 0;
      vector.push(
        Math.min(candidateYears, vacancyRequiredYearsOfExperience) /
          vacancyRequiredYearsOfExperience,
      );
    }

    // Languages — binary encoding per requirement (weight = 1 each)
    if (vacancyLanguageRequirements?.length) {
      const candidateLangs = submission.candidateProfile?.languages || [];

      for (const req of vacancyLanguageRequirements) {
        const met = candidateLangs.some((cl) => {
          if (req.code && cl.code !== req.code) return false;
          if (req.level) {
            if (!cl.level) return false;
            if (
              LanguageLevelRank.indexOf(cl.level) <
              LanguageLevelRank.indexOf(req.level)
            )
              return false;
          }
          return true;
        });
        vector.push(met ? 1 : 0);
      }
    }

    return vector;
  }

  async clusterSubmissions(vacancy: VacancyDto): Promise<void> {
    const submissions =
      await this.vacancySubmissionService.findSubmissionsWithAnswersByVacancyId(
        vacancy.id,
      );

    if (submissions.length < 2) {
      this.logger.warn(
        `Not enough submissions to cluster for vacancy ${vacancy.id}. At least 2 are required.`,
      );
      await this.vacancyRepository.update(
        { id: vacancy.id },
        { needsReclustering: false },
      );
      return;
    }

    const vacancyQuestions =
      await this.vacancyService.findAllQuestionsByVacancyId(vacancy.id);

    const allVacancyTags = vacancy.tags || [];

    const salaryRange = this.calculateSalaryRange(submissions);

    const vectors = submissions.map((s) =>
      this.buildFeatureVector(
        s,
        allVacancyTags,
        salaryRange,
        vacancyQuestions,
        vacancy.languageRequirements,
        vacancy.requiredYearsOfExperience,
      ),
    );

    // If vectors are empty (no features), skip clustering
    if (vectors[0].length === 0) {
      await this.vacancyRepository.update(
        { id: vacancy.id },
        { needsReclustering: false },
      );
      return;
    }

    const numberOfSubmissions = submissions.length;

    // k-means with k >= n yields singleton clusters; callers tolerate empty findSimilar for very small pools.
    const numberOfClusters = Math.max(
      MIN_CLUSTERS,
      Math.ceil(Math.sqrt(numberOfSubmissions / 2)),
    );

    const result = mlKmeans.kmeans(vectors, numberOfClusters, { seed: 42 });

    for (let i = 0; i < submissions.length; i++) {
      submissions[i].clusterId = result.clusters[i];
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.save(VacancySubmission, submissions);
      await manager.update(
        Vacancy,
        { id: vacancy.id },
        { needsReclustering: false },
      );
    });
  }

  async findSimilar(
    submission: VacancySubmission,
  ): Promise<VacancySubmissionDto[]> {
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
      .filter((s) => s.id !== submission.id)
      .map(vacancySubmToVacancySubmDto);
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleClusteringCron(): Promise<void> {
    this.logger.log('Running scheduled clustering for stale vacancies...');

    const vacancyIds = await this.vacancyRepository.find({
      where: { needsReclustering: true },
      select: ['id'],
    });

    if (vacancyIds.length === 0) {
      this.logger.log('No vacancies need reclustering. Skipping.');
      return;
    }

    for (const { id } of vacancyIds) {
      try {
        const vacancy = await this.vacancyService.findVacancyById(id);
        await this.clusterSubmissions(vacancy);
      } catch (error) {
        this.logger.error(
          `Failed to cluster vacancy ${id}: ${error instanceof Error ? error.message : error}`,
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

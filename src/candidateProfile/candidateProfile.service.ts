import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CandidateProfile } from '../entities/candidateProfile';
import { UserRole } from '../entities/role.enum';
import { User } from '../entities/user';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { candidateToCandidateProfileDto } from './map/candidate.map';
import { UserService } from '../user/user.service';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import {
  filterByExperience,
  filterByCountriesCities,
  filterByLanguages,
} from '../utils/filterSubmissionsAndCandidateProfiles';
import { SaplingService } from '../sapling/sapling.service';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CandidateProfile)
    private readonly candidateProfileRepository: Repository<CandidateProfile>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly saplingService: SaplingService,
  ) {}

  async findAllCandidateSubmissionsByCandidateId(
    candidateId: string,
  ): Promise<CandidateProfileDto> {
    const candidateProfile = await this.candidateProfileRepository.findOne({
      where: { id: candidateId },
      relations: ['user', 'submissions'],
    });

    if (!candidateProfile) {
      throw new HttpException(
        'Candidate profile with given ID not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return candidateToCandidateProfileDto(candidateProfile);
  }

  async findAllCandidatesWithFilters(
    profileFilterDto?: RecruitingFilterDto,
    tenantId?: string,
  ): Promise<CandidateProfileDto[]> {
    const query = this.candidateProfileRepository
      .createQueryBuilder('candidateProfile')
      .leftJoinAndSelect('candidateProfile.user', 'user');

    if (tenantId) {
      query
        .innerJoin('candidateProfile.submissions', 'submission')
        .andWhere('submission.tenant_id = :tenantId', { tenantId });
    }

    if (profileFilterDto) {
      filterByExperience(query, profileFilterDto);
      filterByCountriesCities(query, profileFilterDto);
    }

    let candidates = await query.getMany();

    if (profileFilterDto) {
      candidates = filterByLanguages(candidates, profileFilterDto);
    }

    return candidates.map((candidate) =>
      candidateToCandidateProfileDto(candidate),
    );
  }

  async createCandidate(
    createCandidateDto: CreateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const candidate = await this.userRepository.findOne({
      where: {
        firstName: createCandidateDto.firstName,
        lastName: createCandidateDto.lastName,
        email: createCandidateDto.email,
        role: UserRole.candidate,
      },
    });

    if (candidate) {
      throw new HttpException(
        'Candidate with given details already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.authService.hash(
      createCandidateDto.password,
    );

    const newCandidate = this.userRepository.create({
      email: createCandidateDto.email,
      password: hashedPassword,
      firstName: createCandidateDto.firstName,
      lastName: createCandidateDto.lastName,
      role: UserRole.candidate,
    });

    const savedCandidate = await this.userRepository.save(newCandidate);

    const aiResult = await this.saplingService.detectAiContent(
      createCandidateDto.resume,
    );

    const candidateProfile = this.candidateProfileRepository.create({
      yearsOfExperience: createCandidateDto.yearsOfExperience,
      country: createCandidateDto.country,
      city: createCandidateDto.city,
      languages: createCandidateDto.languages,
      resume: createCandidateDto.resume,
      resumeAiScore: aiResult?.score ?? null,
      resumeAiSentenceScores: aiResult?.sentenceScores ?? null,
      user: savedCandidate,
    });

    await this.candidateProfileRepository.save(candidateProfile);

    return candidateToCandidateProfileDto(candidateProfile);
  }

  async updateCandidate(
    candidateId: string,
    updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const user = await this.userService.findById(candidateId);

    if (!user.candidateProfile) {
      throw new HttpException(
        'User associated with given candidate profile not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const candidateProfile = user.candidateProfile;

    const { resume, ...candidateFields } = updateCandidateProfileDto;

    // Populate candidateProfile entity
    Object.keys(candidateFields).forEach((key) => {
      if (candidateFields[key] !== undefined) {
        candidateProfile[key] = candidateFields[key];
      }
    });

    if (resume !== undefined) {
      candidateProfile.resume = resume;

      const aiResult = await this.saplingService.detectAiContent(resume);

      candidateProfile.resumeAiScore = aiResult?.score ?? null;
      candidateProfile.resumeAiSentenceScores =
        aiResult?.sentenceScores ?? null;
    }

    const updatedCandidateProfile =
      await this.candidateProfileRepository.save(candidateProfile);

    // Populate user entity
    if (updateCandidateProfileDto.firstName)
      user.firstName = updateCandidateProfileDto.firstName;

    if (updateCandidateProfileDto.lastName)
      user.lastName = updateCandidateProfileDto.lastName;

    await this.userRepository.save(user);

    const updatedWithUser = await this.findProfileById(
      updatedCandidateProfile.id,
    );

    return candidateToCandidateProfileDto(updatedWithUser);
  }

  async parseResumeFile(
    candidateId: string,
    file: Express.Multer.File,
    extension: string,
  ): Promise<CandidateProfileDto> {
    const user = await this.userService.findById(candidateId);

    if (!user.candidateProfile) {
      throw new HttpException(
        'User associated with given candidate profile not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const candidateProfile = user.candidateProfile;

    const extractedText =
      await this.saplingService.extractTextFromResumeDependingOnExtension(
        file,
        extension,
      );

    if (extractedText) {
      candidateProfile.resume = extractedText;

      const aiResult = await this.saplingService.detectAiContent(extractedText);

      candidateProfile.resumeAiScore = aiResult?.score ?? null;
      candidateProfile.resumeAiSentenceScores =
        aiResult?.sentenceScores ?? null;
    } else {
      throw new HttpException(
        'Failed to extract text from resume. Please upload a valid PDF or DOCX file.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.candidateProfileRepository.save(candidateProfile);

    const updated = await this.findProfileById(candidateProfile.id);

    return candidateToCandidateProfileDto(updated);
  }

  async findCandidateByUserId(userId: string): Promise<CandidateProfile> {
    const candidateProfile = await this.candidateProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!candidateProfile) {
      throw new HttpException(
        'Candidate profile with given user ID not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return candidateProfile;
  }

  private async findProfileById(id: string) {
    const candidateProfile = await this.candidateProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!candidateProfile) {
      throw new HttpException(
        'Candidate profile with given ID not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    return candidateProfile;
  }
}

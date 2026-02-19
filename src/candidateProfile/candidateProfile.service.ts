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
  filterByExperienceCountriesCities,
  filterByLanguages,
} from '../utils/filterSubmissionsAndCandidateProfiles';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CandidateProfile)
    private readonly candidateProfileRepository: Repository<CandidateProfile>,

    private readonly userService: UserService,
    private readonly authService: AuthService,
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
      filterByExperienceCountriesCities(query, profileFilterDto);
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

    const candidateProfile = this.candidateProfileRepository.create({
      yearsOfExperience: createCandidateDto.yearsOfExperience,
      country: createCandidateDto.country,
      city: createCandidateDto.city,
      languages: createCandidateDto.languages,
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

    const { ...candidateFields } = updateCandidateProfileDto;

    // Populate candidateProfile entity
    Object.keys(candidateFields).forEach((key) => {
      if (candidateFields[key] !== undefined) {
        candidateProfile[key] = candidateFields[key];
      }
    });

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

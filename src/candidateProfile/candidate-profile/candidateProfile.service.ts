import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { CandidateProfile } from '../../entities/candidateProfile';
import { UserRole } from '../../entities/role.enum';
import { User } from '../../entities/user';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { candidateToCandidateProfileDto } from './map/candidate.map';
import { UserService } from '../../user/user.service';
import { CandidateProfileFilterDto } from '../../candidateProfile/candidate-profile/dto/candidateProfileFilter.dto';
import {
  LanguageLevelRank,
  LanguageProficiency,
} from '../../entities/hiring.enum';

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

  async findAllCandidatesWithFilters(
    profileFilterDto?: CandidateProfileFilterDto,
  ): Promise<CandidateProfileDto[]> {
    let candidates = await this.candidateProfileRepository.find({
      relations: ['user'],
    });

    if (profileFilterDto) {
      const query = this.candidateProfileRepository
        .createQueryBuilder('candidateProfile')
        .leftJoinAndSelect('candidateProfile.user', 'user');

      if (profileFilterDto?.minYearsOfExperience) {
        query.andWhere(
          'candidateProfile.years_of_experience >= :minYearsOfExperience',
          {
            minYearsOfExperience: profileFilterDto.minYearsOfExperience,
          },
        );
      }

      if (profileFilterDto?.maxYearsOfExperience) {
        query.andWhere(
          'candidateProfile.years_of_experience <= :maxYearsOfExperience',
          {
            maxYearsOfExperience: profileFilterDto.maxYearsOfExperience,
          },
        );
      }

      if (
        profileFilterDto?.countries &&
        profileFilterDto.countries.length > 0
      ) {
        query.andWhere('candidateProfile.country = ANY(:countries)', {
          countries: profileFilterDto.countries,
        });
      }

      if (profileFilterDto?.cities && profileFilterDto.cities.length > 0) {
        query.andWhere('candidateProfile.city = ANY(:cities)', {
          cities: profileFilterDto.cities,
        });
      }
      candidates = await query.getMany();

      /** three scenarios for language filtering:
       *1) when code and level are provided, return candidates that have this specific code and level equal or higher than provided
       *2) when only code is provided, return candidates that have this specific code at any level
       *3) when only level is provided, return candidates that have any language at level equal or higher than provided
       **/

      if (profileFilterDto?.languages?.length) {
        candidates = candidates.filter((c) =>
          profileFilterDto?.languages?.some((requiredLang) =>
            this.meetsLanguageRequirement(c.languages, requiredLang),
          ),
        );
      }
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
    const candidateProfile = await this.userRepository
      .findOne({
        where: { id: userId },
        relations: ['candidateProfile'],
      })
      .then((user) => user?.candidateProfile);

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

  private meetsLanguageRequirement(
    candidateLangs: LanguageProficiency[],
    required: LanguageProficiency,
  ): boolean {
    return candidateLangs.some((cl) => {
      if (required.code && cl.code !== required.code) return false;

      if (required.level) {
        if (!cl.level) return false;

        if (
          LanguageLevelRank.indexOf(cl.level) <
          LanguageLevelRank.indexOf(required.level)
        )
          return false;
      }

      return true;
    });
  }
}

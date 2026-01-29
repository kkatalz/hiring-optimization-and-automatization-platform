import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth/auth.service';
import { CandidateProfile } from '../../entities/candidateProfile';
import { UserRole } from '../../entities/role.enum';
import { User } from '../../entities/user';
import { userToUserDto } from '../../user/map/user.map';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { candidateToCandidateProfileDto } from './map/candidate.map';

@Injectable()
export class CandidateProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CandidateProfile)
    private readonly candidateProfileRepository: Repository<CandidateProfile>,

    private readonly authService: AuthService,
  ) {}

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

    return candidateToCandidateProfileDto({
      user: {
        ...userToUserDto({ user: savedCandidate }),
        candidateProfile: candidateProfile,
      },
    });
  }

  async updateCandidate(
    candidateId: string,
    updateCandidateProfileDto: UpdateCandidateProfileDto,
  ): Promise<CandidateProfileDto> {
    const candidateProfile = await this.candidateProfileRepository.findOne({
      where: { id: candidateId },
      relations: ['user'],
    });

    if (!candidateProfile) {
      throw new HttpException(
        'Candidate profile with given id not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!candidateProfile.user) {
      throw new HttpException(
        'User associated with candidate profile not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const { ...candidateFields } = updateCandidateProfileDto;

    Object.keys(candidateFields).forEach((key) => {
      if (candidateFields[key] !== undefined) {
        candidateProfile[key] = candidateFields[key];
      }
    });

    const updatedCandidateProfile =
      await this.candidateProfileRepository.save(candidateProfile);

    if (updateCandidateProfileDto.firstName)
      candidateProfile.user.firstName = updateCandidateProfileDto.firstName;

    if (updateCandidateProfileDto.lastName)
      candidateProfile.user.lastName = updateCandidateProfileDto.lastName;

    const savedUser = await this.userRepository.save(candidateProfile.user);

    return candidateToCandidateProfileDto({
      user: {
        ...userToUserDto({ user: savedUser }),
        candidateProfile: updatedCandidateProfile,
      },
    });
  }
}

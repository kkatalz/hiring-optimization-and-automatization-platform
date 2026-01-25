import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../entities/interview';
import { InterviewStatus } from '../entities/status.enum';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
  ) {}

  async getAllInterviews(viewerId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { tenantId: viewerId },
    });
  }

  async updateInterviewStatus(
    interviewId: string,
    status: InterviewStatus,
    notes?: string,
  ): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.status = status;
    if (notes) {
      interview.notes = notes;
    }

    return this.interviewRepository.save(interview);
  }

  async getTenantIdByInterviewId(interviewId: string): Promise<string> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview.tenantId;
  }
}

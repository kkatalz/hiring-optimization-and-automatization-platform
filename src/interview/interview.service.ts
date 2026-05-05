import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../entities/interview';
import {
  InterviewStatus,
  VacancySubmissionStatus,
} from '../entities/statuses.enum';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import { MailService } from '../mail/mail.service';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UserDto } from '../user/dto/user.dto';
import { validateTenantAccess } from '../utils/validate';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private vacancySubmissionService: VacancySubmissionService,
    private mailService: MailService,
  ) {}

  async getAllInterviews(viewersTenantId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { tenantId: viewersTenantId },
    });
  }

  async getMyInterviews(viewer: UserDto): Promise<Interview[]> {
    return this.interviewRepository
      .createQueryBuilder('interview')
      .where('interview.candidateEmail = :email', { email: viewer.email })
      .orWhere(
        'interview.interviewersEmails @> :emailJson AND interview.tenantId = :tenantId',
        {
          emailJson: JSON.stringify([viewer.email]),
          tenantId: viewer.tenantId ?? null,
        },
      )
      .orderBy('interview.scheduledDate', 'ASC')
      .getMany();
  }

  async scheduleInterview(
    dto: CreateInterviewDto,
    recruiter: UserDto,
  ): Promise<Interview> {
    if (dto.scheduledDate.getTime() < Date.now()) {
      throw new BadRequestException(
        'scheduledDate must be in the present or future.',
      );
    }

    const submission = await this.vacancySubmissionService.findOneById(
      dto.submissionId,
      ['candidateProfile', 'candidateProfile.user', 'vacancy'],
    );

    validateTenantAccess(recruiter, submission.tenantId);

    const candidateEmail = submission.candidateProfile?.user?.email;
    if (!candidateEmail) {
      throw new NotFoundException(
        'Candidate email not found for this submission.',
      );
    }

    const interview = this.interviewRepository.create({
      meetLink: dto.meetLink,
      scheduledDate: dto.scheduledDate,
      durationMinutes: dto.durationMinutes ?? 60,
      submissionId: submission.id,
      tenantId: submission.tenantId,
      interviewersEmails: dto.interviewersEmails ?? [],
      candidateEmail,
      notes: dto.notes,
      status: InterviewStatus.scheduled,
    });

    const saved = await this.interviewRepository.save(interview);

    if (submission.status === VacancySubmissionStatus.pending) {
      await this.vacancySubmissionService.setStatus(
        submission,
        VacancySubmissionStatus.interviewing,
      );
    }

    await this.notifyAttendees(saved, submission, 'invitation');

    return saved;
  }

  async updateInterviewStatus(
    interviewId: string,
    status: InterviewStatus,
    notes?: string,
  ): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
      relations: [
        'submission',
        'submission.candidateProfile',
        'submission.candidateProfile.user',
        'submission.vacancy',
      ],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const wasCanceled = interview.status === InterviewStatus.canceled;
    interview.status = status;
    if (notes) {
      interview.notes = notes;
    }

    const saved = await this.interviewRepository.save(interview);

    if (status === InterviewStatus.canceled && !wasCanceled) {
      await this.notifyAttendees(saved, saved.submission, 'cancellation');
    }

    return saved;
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

  private async notifyAttendees(
    interview: Interview,
    submission: VacancySubmission,
    type: 'invitation' | 'cancellation',
  ): Promise<void> {
    const candidateName = submission.candidateProfile?.user
      ? `${submission.candidateProfile.user.firstName} ${submission.candidateProfile.user.lastName}`
      : 'Candidate';
    const vacancyName = submission.vacancy?.name ?? 'the position';

    const recipients = [
      interview.candidateEmail,
      ...(interview.interviewersEmails ?? []),
    ].filter((email) => !!email);

    if (recipients.length === 0) return;

    const formattedDate = interview.scheduledDate.toUTCString();
    const isInvitation = type === 'invitation';

    const subject = isInvitation
      ? `Interview scheduled — ${vacancyName}`
      : `Interview canceled — ${vacancyName}`;

    const text = isInvitation
      ? `Hi,

An interview for ${candidateName} (${vacancyName}) has been scheduled.

When: ${formattedDate}
Duration: ${interview.durationMinutes} minutes
Meeting link: ${interview.meetLink}

See you there.`
      : `Hi,

The interview for ${candidateName} (${vacancyName}) scheduled for ${formattedDate} has been canceled.`;

    const html = isInvitation
      ? `<p>Hi,</p>
<p>An interview for <strong>${candidateName}</strong> (${vacancyName}) has been scheduled.</p>
<ul>
  <li><strong>When:</strong> ${formattedDate}</li>
  <li><strong>Duration:</strong> ${interview.durationMinutes} minutes</li>
  <li><strong>Meeting link:</strong> <a href="${interview.meetLink}">${interview.meetLink}</a></li>
</ul>
<p>See you there.</p>`
      : `<p>Hi,</p>
<p>The interview for <strong>${candidateName}</strong> (${vacancyName}) scheduled for ${formattedDate} has been <strong>canceled</strong>.</p>`;

    await Promise.all(
      recipients.map((to) =>
        this.mailService.send({ to, subject, text, html }),
      ),
    );
  }
}

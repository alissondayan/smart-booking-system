import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../../../../shared/infrastructure/queue/queue.constants';
import { EMAIL_PORT, EmailPort } from '../../domain/ports/email.port';
import { EmailJobName, SendEmailJob } from './email.job.types';

@Injectable()
@Processor(EMAIL_NOTIFICATIONS_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
  ) {
    super();
  }

  async process(job: Job<SendEmailJob>): Promise<void> {
    if (job.name !== EmailJobName.SEND_EMAIL) {
      this.logger.warn(`Ignoring unsupported email job: ${job.name}`);
      return;
    }

    await this.emailPort.send(job.data);
  }
}

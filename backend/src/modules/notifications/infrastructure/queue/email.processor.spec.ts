import { Job } from 'bullmq';
import { EmailPort } from '../../domain/ports/email.port';
import { EmailJobName, SendEmailJob } from './email.job.types';
import { EmailProcessor } from './email.processor';

describe('EmailProcessor', () => {
  it('sends email jobs through EmailPort', async () => {
    const emailPort: EmailPort = {
      send: jest.fn().mockResolvedValue(undefined),
    };
    const processor = new EmailProcessor(emailPort);
    const data: SendEmailJob = {
      to: 'customer@example.com',
      subject: 'Appointment confirmed',
      html: '<p>Confirmed</p>',
    };

    await processor.process({
      name: EmailJobName.SEND_EMAIL,
      data,
    } as Job<SendEmailJob>);

    expect(emailPort.send).toHaveBeenCalledWith(data);
  });
});

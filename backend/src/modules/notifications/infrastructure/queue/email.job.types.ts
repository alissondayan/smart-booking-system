export enum EmailJobName {
  SEND_EMAIL = 'send-email',
}

export interface SendEmailJob {
  to: string;
  subject: string;
  html: string;
}

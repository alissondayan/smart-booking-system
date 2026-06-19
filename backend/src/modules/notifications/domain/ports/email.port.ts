export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailPort {
  send(params: SendEmailParams): Promise<void>;
}

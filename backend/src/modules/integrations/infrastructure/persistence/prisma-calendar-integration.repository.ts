import { Injectable } from '@nestjs/common';
import { CalendarIntegration, CalendarProvider } from '@prisma/client';
import { EncryptionService } from '../../../../shared/infrastructure/crypto/encryption.service';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CalendarIntegrationRecord,
  CalendarIntegrationRepositoryPort,
  SaveGoogleCalendarIntegrationData,
} from '../../domain/ports/calendar-integration.repository.port';

@Injectable()
export class PrismaCalendarIntegrationRepository
  implements CalendarIntegrationRepositoryPort
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findGoogle(): Promise<CalendarIntegrationRecord | null> {
    const integration = await this.prismaService.calendarIntegration.findUnique({
      where: { provider: CalendarProvider.GOOGLE },
    });

    return integration ? this.toRecord(integration) : null;
  }

  async saveGoogle(
    data: SaveGoogleCalendarIntegrationData,
  ): Promise<CalendarIntegrationRecord> {
    const integration = await this.prismaService.calendarIntegration.upsert({
      where: { provider: CalendarProvider.GOOGLE },
      update: {
        accessToken: this.encryptionService.encrypt(data.accessToken),
        refreshToken: this.encryptionService.encrypt(data.refreshToken),
        tokenExpiresAt: data.tokenExpiresAt,
        calendarId: data.calendarId,
      },
      create: {
        provider: CalendarProvider.GOOGLE,
        accessToken: this.encryptionService.encrypt(data.accessToken),
        refreshToken: this.encryptionService.encrypt(data.refreshToken),
        tokenExpiresAt: data.tokenExpiresAt,
        calendarId: data.calendarId,
      },
    });

    return this.toRecord(integration);
  }

  async deleteGoogle(): Promise<void> {
    await this.prismaService.calendarIntegration.deleteMany({
      where: { provider: CalendarProvider.GOOGLE },
    });
  }

  private toRecord(integration: CalendarIntegration): CalendarIntegrationRecord {
    return {
      id: integration.id,
      provider: 'GOOGLE',
      accessToken: this.encryptionService.decrypt(integration.accessToken),
      refreshToken: this.encryptionService.decrypt(integration.refreshToken),
      tokenExpiresAt: integration.tokenExpiresAt,
      calendarId: integration.calendarId,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}

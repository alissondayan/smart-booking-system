import { Injectable } from '@nestjs/common';
import { AvailabilityRule, BlockedTime, DateAvailability, Holiday, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { AvailabilityRuleEntity } from '../../domain/entities/availability-rule.entity';
import { BlockedTimeEntity } from '../../domain/entities/blocked-time.entity';
import { DateAvailabilityEntity } from '../../domain/entities/date-availability.entity';
import { HolidayEntity } from '../../domain/entities/holiday.entity';
import {
  AvailabilityRepositoryPort,
  CreateBlockedTimeData,
  CreateHolidayData,
  SetAvailabilityRuleData,
  SetDateAvailabilityData,
} from '../../domain/ports/availability.repository.port';

@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepositoryPort {
  constructor(private readonly prismaService: PrismaService) {}

  async listRules(): Promise<AvailabilityRuleEntity[]> {
    const rules = await this.prismaService.availabilityRule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });

    return rules.map((rule) => this.ruleToDomain(rule));
  }

  async replaceRules(
    rules: SetAvailabilityRuleData[],
  ): Promise<AvailabilityRuleEntity[]> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany();
      await tx.availabilityRule.createMany({
        data: rules.map((rule) => ({
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          isActive: rule.isActive ?? true,
        })),
      });
    });

    return this.listRules();
  }

  async findRuleByDayOfWeek(
    dayOfWeek: number,
  ): Promise<AvailabilityRuleEntity | null> {
    const rule = await this.prismaService.availabilityRule.findFirst({
      where: { dayOfWeek, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return rule ? this.ruleToDomain(rule) : null;
  }

  async listDateAvailabilities(
    from?: Date,
    to?: Date,
  ): Promise<DateAvailabilityEntity[]> {
    const overrides = await this.prismaService.dateAvailability.findMany({
      where: this.dateRangeWhere(from, to),
      orderBy: { date: 'asc' },
    });

    return overrides.map((override) => this.dateAvailabilityToDomain(override));
  }

  async findDateAvailability(
    date: Date,
  ): Promise<DateAvailabilityEntity | null> {
    const override = await this.prismaService.dateAvailability.findUnique({
      where: { date: this.onlyDate(date) },
    });

    return override ? this.dateAvailabilityToDomain(override) : null;
  }

  async setDateAvailability(
    data: SetDateAvailabilityData,
  ): Promise<DateAvailabilityEntity> {
    const override = await this.prismaService.dateAvailability.upsert({
      where: { date: this.onlyDate(data.date) },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        isClosed: data.isClosed ?? false,
      },
      create: {
        date: this.onlyDate(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        isClosed: data.isClosed ?? false,
      },
    });

    return this.dateAvailabilityToDomain(override);
  }

  async deleteDateAvailability(date: Date): Promise<void> {
    await this.prismaService.dateAvailability.deleteMany({
      where: { date: this.onlyDate(date) },
    });
  }

  async listBlockedTimes(from?: Date, to?: Date): Promise<BlockedTimeEntity[]> {
    const blockedTimes = await this.prismaService.blockedTime.findMany({
      where:
        from || to
          ? {
              startAt: { lte: to },
              endAt: { gte: from },
            }
          : undefined,
      orderBy: { startAt: 'asc' },
    });

    return blockedTimes.map((blockedTime) => this.blockedTimeToDomain(blockedTime));
  }

  async listBlockedTimesOverlapping(
    from: Date,
    to: Date,
  ): Promise<BlockedTimeEntity[]> {
    return this.listBlockedTimes(from, to);
  }

  async createBlockedTime(
    data: CreateBlockedTimeData,
  ): Promise<BlockedTimeEntity> {
    const blockedTime = await this.prismaService.blockedTime.create({
      data,
    });

    return this.blockedTimeToDomain(blockedTime);
  }

  async deleteBlockedTime(id: string): Promise<void> {
    await this.prismaService.blockedTime.deleteMany({ where: { id } });
  }

  async listHolidays(): Promise<HolidayEntity[]> {
    const holidays = await this.prismaService.holiday.findMany({
      orderBy: { date: 'asc' },
    });

    return holidays.map((holiday) => this.holidayToDomain(holiday));
  }

  async findHoliday(date: Date): Promise<HolidayEntity | null> {
    const holiday = await this.prismaService.holiday.findUnique({
      where: { date: this.onlyDate(date) },
    });

    return holiday ? this.holidayToDomain(holiday) : null;
  }

  async createHoliday(data: CreateHolidayData): Promise<HolidayEntity> {
    const holiday = await this.prismaService.holiday.create({
      data: { date: this.onlyDate(data.date), label: data.label },
    });

    return this.holidayToDomain(holiday);
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.prismaService.holiday.deleteMany({ where: { id } });
  }

  private dateRangeWhere(
    from?: Date,
    to?: Date,
  ): Prisma.DateAvailabilityWhereInput | undefined {
    return from || to
      ? {
          date: {
            gte: from ? this.onlyDate(from) : undefined,
            lte: to ? this.onlyDate(to) : undefined,
          },
        }
      : undefined;
  }

  private onlyDate(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private ruleToDomain(rule: AvailabilityRule): AvailabilityRuleEntity {
    return new AvailabilityRuleEntity(rule);
  }

  private dateAvailabilityToDomain(
    override: DateAvailability,
  ): DateAvailabilityEntity {
    return new DateAvailabilityEntity(override);
  }

  private blockedTimeToDomain(blockedTime: BlockedTime): BlockedTimeEntity {
    return new BlockedTimeEntity(blockedTime);
  }

  private holidayToDomain(holiday: Holiday): HolidayEntity {
    return new HolidayEntity(holiday);
  }
}

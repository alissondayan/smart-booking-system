import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-06-20T10:00:00.000Z' })
  @IsDateString()
  newStartAt: string;
}

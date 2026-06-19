import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class BookAppointmentDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2026-06-20T09:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

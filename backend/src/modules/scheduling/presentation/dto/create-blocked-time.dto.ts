import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBlockedTimeDto {
  @ApiProperty({ example: '2026-06-20T12:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2026-06-20T13:00:00.000Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

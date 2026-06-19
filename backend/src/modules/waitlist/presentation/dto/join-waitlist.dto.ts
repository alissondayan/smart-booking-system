import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class JoinWaitlistDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ example: '2026-06-20' })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;
}

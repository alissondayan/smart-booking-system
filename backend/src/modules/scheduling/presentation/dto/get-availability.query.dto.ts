import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class GetAvailabilityQueryDto {
  @ApiProperty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2026-06-20' })
  @IsDateString()
  date: string;
}

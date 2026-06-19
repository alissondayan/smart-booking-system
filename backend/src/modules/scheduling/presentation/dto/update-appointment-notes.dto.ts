import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentNotesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

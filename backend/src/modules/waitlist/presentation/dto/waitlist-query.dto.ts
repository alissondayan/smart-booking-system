import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { WaitlistStatus } from '../../../../shared/domain/enums/waitlist-status.enum';

export class WaitlistQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ enum: WaitlistStatus })
  @IsOptional()
  @IsEnum(WaitlistStatus)
  status?: WaitlistStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetDateAvailabilityDto {
  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

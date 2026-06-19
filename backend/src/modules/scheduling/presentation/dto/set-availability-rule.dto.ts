import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class AvailabilityRuleDto {
  @ApiProperty({ minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetAvailabilityRuleDto {
  @ApiProperty({ type: [AvailabilityRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityRuleDto)
  rules: AvailabilityRuleDto[];
}

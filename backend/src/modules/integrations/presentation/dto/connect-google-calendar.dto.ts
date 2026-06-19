import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ConnectGoogleCalendarDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  code: string;
}

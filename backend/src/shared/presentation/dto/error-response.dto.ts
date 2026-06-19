import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorBodyDto {
  @ApiPropertyOptional({ example: 'VALIDATION_ERROR' })
  code?: string;

  @ApiProperty({ example: 'Request validation failed' })
  message: string;

  @ApiPropertyOptional({ type: [String] })
  details?: string[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: '2026-06-19T16:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/auth/register' })
  path: string;

  @ApiProperty({ type: ErrorBodyDto })
  error: ErrorBodyDto;
}

import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiStandardErrors() {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ErrorResponseDto,
      description: 'Validation or malformed request error.',
    }),
    ApiUnauthorizedResponse({
      type: ErrorResponseDto,
      description: 'Authentication is missing or invalid.',
    }),
    ApiForbiddenResponse({
      type: ErrorResponseDto,
      description: 'Authenticated user does not have the required role.',
    }),
    ApiNotFoundResponse({
      type: ErrorResponseDto,
      description: 'Requested resource was not found.',
    }),
    ApiConflictResponse({
      type: ErrorResponseDto,
      description: 'Request conflicts with current resource state.',
    }),
  );
}

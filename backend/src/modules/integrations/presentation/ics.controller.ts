import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { GenerateIcsUseCase } from '../application/generate-ics.use-case';

@ApiTags('ICS')
@Controller('appointments')
export class IcsController {
  constructor(private readonly generateIcsUseCase: GenerateIcsUseCase) {}

  @Get(':id/ics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'RFC 5545 ICS file.' })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ): Promise<void> {
    const ics = await this.generateIcsUseCase.execute({
      appointmentId: id,
      userId: user.id,
      role: user.role,
    });

    response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="appointment-${id}.ics"`,
    );
    response.send(ics);
  }
}

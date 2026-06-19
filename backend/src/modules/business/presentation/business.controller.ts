import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { BusinessResponse } from '../application/business-response';
import { GetBusinessUseCase } from '../application/get-business.use-case';
import { UpdateBusinessUseCase } from '../application/update-business.use-case';
import { UploadLogoUseCase } from '../application/upload-logo.use-case';
import { UpdateBusinessDto } from './dto/update-business.dto';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
  constructor(
    private readonly getBusinessUseCase: GetBusinessUseCase,
    private readonly updateBusinessUseCase: UpdateBusinessUseCase,
    private readonly uploadLogoUseCase: UploadLogoUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Business profile.' })
  getBusiness(): Promise<BusinessResponse> {
    return this.getBusinessUseCase.execute();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Updated business profile.' })
  updateBusiness(@Body() dto: UpdateBusinessDto): Promise<BusinessResponse> {
    return this.updateBusinessUseCase.execute(dto);
  }

  @Post('logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Business profile with updated logo URL.' })
  uploadLogo(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BusinessResponse> {
    if (!file) {
      throw new BadRequestException('Logo file is required');
    }

    return this.uploadLogoUseCase.execute({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });
  }
}

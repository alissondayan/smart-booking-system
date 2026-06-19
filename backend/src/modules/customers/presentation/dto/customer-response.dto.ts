import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';

export class CustomerSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  appointmentCount: number;
}

export class CustomerAppointmentHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  endAt: Date;

  @ApiProperty({ enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiPropertyOptional()
  notes?: string | null;
}

export class CustomerDetailsResponseDto extends CustomerSummaryResponseDto {
  @ApiProperty({ type: [CustomerAppointmentHistoryItemDto] })
  appointments: CustomerAppointmentHistoryItemDto[];
}

export class PaginatedCustomersResponseDto {
  @ApiProperty({ type: [CustomerSummaryResponseDto] })
  items: CustomerSummaryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

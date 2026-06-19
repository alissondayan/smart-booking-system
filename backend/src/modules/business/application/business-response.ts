import { BusinessEntity, BusinessProps } from '../domain/entities/business.entity';

export type BusinessResponse = BusinessProps;

export function toBusinessResponse(business: BusinessEntity): BusinessResponse {
  return business.toJSON();
}

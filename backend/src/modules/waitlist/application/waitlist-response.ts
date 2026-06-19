import { WaitlistEntryEntity, WaitlistEntryProps } from '../domain/entities/waitlist-entry.entity';

export type WaitlistEntryResponse = WaitlistEntryProps;

export function toWaitlistEntryResponse(
  entry: WaitlistEntryEntity,
): WaitlistEntryResponse {
  return entry.toJSON();
}

export function toWaitlistEntryResponses(
  entries: WaitlistEntryEntity[],
): WaitlistEntryResponse[] {
  return entries.map(toWaitlistEntryResponse);
}

export enum CalendarSyncJobName {
  SYNC_APPOINTMENT = 'sync-appointment',
  UPDATE_APPOINTMENT = 'update-appointment',
  REMOVE_APPOINTMENT = 'remove-appointment',
}

export interface CalendarSyncJob {
  appointmentId: string;
  googleEventId?: string | null;
}

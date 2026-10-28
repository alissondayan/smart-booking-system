import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { queryKeys } from "@/shared/api/query-keys";
import {
  connectGoogleCalendar,
  disconnectCalendar,
  getCalendarStatus,
} from "../api/admin-integrations.api";
export function useCalendarStatus() {
  return useQuery({
    queryKey: queryKeys.integrations.calendar(),
    queryFn: getCalendarStatus,
  });
}
export function useConnectGoogleCalendar() {
  return useMutation({ mutationFn: connectGoogleCalendar });
}
export function useDisconnectCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: queryKeys.integrations.calendar(),
      }),
  });
}

const calendarErrorMessages: Record<string, string> = {
  access_denied:
    "Google access was denied, so the calendar was not connected.",
  invalid_state:
    "The connection request expired or could not be verified. Please start the connection again.",
  connection_failed:
    "Could not complete the Google Calendar connection. Please try again.",
};

export interface CalendarConnectionNotice {
  tone: "success" | "error";
  message: string;
}

function toCalendarNotice(
  result: string | null,
  reason: string | null,
): CalendarConnectionNotice | null {
  if (!result) return null;
  if (result === "connected")
    return { tone: "success", message: "Google Calendar is connected." };
  return {
    tone: "error",
    message:
      calendarErrorMessages[reason ?? ""] ??
      calendarErrorMessages.connection_failed,
  };
}

export function useCalendarConnectionResult(): CalendarConnectionNotice | null {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const result = searchParams.get("calendar");
  const reason = searchParams.get("reason");
  // The result parameters are stripped from the URL below, so the notice is
  // captured on first render to stay visible afterwards.
  const [notice] = useState(() => toCalendarNotice(result, reason));

  useEffect(() => {
    if (!result) return;
    if (result === "connected") {
      void qc.invalidateQueries({
        queryKey: queryKeys.integrations.calendar(),
      });
    }
    router.replace("/admin/integrations");
  }, [qc, result, router]);

  return notice;
}

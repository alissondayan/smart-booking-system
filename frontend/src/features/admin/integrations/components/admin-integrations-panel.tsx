"use client";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  useCalendarStatus,
  useConnectGoogleCalendar,
  useDisconnectCalendar,
} from "../hooks/use-admin-integrations";
export function AdminIntegrationsPanel() {
  const status = useCalendarStatus();
  const connect = useConnectGoogleCalendar();
  const disconnect = useDisconnectCalendar();
  if (status.isPending)
    return (
      <EmptyState
        title="Loading integrations"
        description="Checking calendar status."
      />
    );
  if (status.isError) return <ErrorState description={status.error.message} />;
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between gap-3">
          <CardTitle>Google Calendar</CardTitle>
          <StatusBadge
            label={status.data.connected ? "CONNECTED" : "DISCONNECTED"}
            tone={status.data.connected ? "success" : "neutral"}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Connect calendar sync for owner appointments. The OAuth callback is
          handled through the backend integration endpoint.
        </p>
        {status.data.calendarId ? (
          <p>Calendar: {status.data.calendarId}</p>
        ) : null}
        <div className="flex gap-3">
          {status.data.connected ? (
            <Button
              disabled={disconnect.isPending}
              onClick={() => disconnect.mutate()}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              disabled={connect.isPending}
              onClick={() =>
                connect.mutate(undefined, {
                  onSuccess: (data) => {
                    window.location.href = data.authUrl;
                  },
                })
              }
            >
              Connect Google Calendar
            </Button>
          )}
        </div>
        {connect.error ? (
          <p className="text-sm text-red-700">{connect.error.message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

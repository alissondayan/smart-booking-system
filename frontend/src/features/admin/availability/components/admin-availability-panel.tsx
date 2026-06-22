"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { ErrorState } from "@/shared/ui/error-state";
import { Input } from "@/shared/ui/input";
import {
  useAvailabilityRules,
  useBlockedTimes,
  useCreateBlockedTime,
  useCreateHoliday,
  useDateOverrides,
  useDeleteBlockedTime,
  useDeleteDateOverride,
  useDeleteHoliday,
  useHolidays,
  useReplaceAvailabilityRules,
  useSetDateOverride,
} from "../hooks/use-admin-availability";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AdminAvailabilityPanel() {
  const rules = useAvailabilityRules();
  const dates = useDateOverrides();
  const blocked = useBlockedTimes();
  const holidays = useHolidays();
  const replaceRules = useReplaceAvailabilityRules();
  const setDate = useSetDateOverride();
  const deleteDate = useDeleteDateOverride();
  const createBlocked = useCreateBlockedTime();
  const deleteBlocked = useDeleteBlockedTime();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const [ruleRows, setRuleRows] = useState(
    dayNames.map((_, dayOfWeek) => ({
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      isActive: dayOfWeek > 0 && dayOfWeek < 6,
    })),
  );
  const [dateForm, setDateForm] = useState({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    isClosed: false,
  });
  const [blockedForm, setBlockedForm] = useState({
    startAt: "",
    endAt: "",
    reason: "",
  });
  const [holidayForm, setHolidayForm] = useState({ date: "", label: "" });

  if (
    rules.isPending ||
    dates.isPending ||
    blocked.isPending ||
    holidays.isPending
  )
    return (
      <EmptyState
        title="Loading availability"
        description="Fetching availability settings."
      />
    );
  if (rules.isError) return <ErrorState description={rules.error.message} />;
  if (dates.isError) return <ErrorState description={dates.error.message} />;
  if (blocked.isError)
    return <ErrorState description={blocked.error.message} />;
  if (holidays.isError)
    return <ErrorState description={holidays.error.message} />;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {ruleRows.map((row, index) => (
            <div
              className="grid gap-2 rounded-[var(--radius-base)] border border-[var(--color-border)] p-3 md:grid-cols-[1fr_120px_120px_100px]"
              key={row.dayOfWeek}
            >
              <span className="font-medium">{dayNames[row.dayOfWeek]}</span>
              <Input
                value={row.startTime}
                type="time"
                onChange={(e) =>
                  setRuleRows((v) =>
                    v.map((r, i) =>
                      i === index ? { ...r, startTime: e.target.value } : r,
                    ),
                  )
                }
              />
              <Input
                value={row.endTime}
                type="time"
                onChange={(e) =>
                  setRuleRows((v) =>
                    v.map((r, i) =>
                      i === index ? { ...r, endTime: e.target.value } : r,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={row.isActive}
                  type="checkbox"
                  onChange={(e) =>
                    setRuleRows((v) =>
                      v.map((r, i) =>
                        i === index ? { ...r, isActive: e.target.checked } : r,
                      ),
                    )
                  }
                />
                Active
              </label>
            </div>
          ))}
          <Button
            disabled={replaceRules.isPending}
            onClick={() => replaceRules.mutate(ruleRows)}
          >
            Save weekly rules
          </Button>
          {replaceRules.error ? (
            <p className="text-sm text-red-700">{replaceRules.error.message}</p>
          ) : null}
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Date override</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              type="date"
              value={dateForm.date}
              onChange={(e) =>
                setDateForm((v) => ({ ...v, date: e.target.value }))
              }
            />
            <Input
              type="time"
              value={dateForm.startTime}
              onChange={(e) =>
                setDateForm((v) => ({ ...v, startTime: e.target.value }))
              }
            />
            <Input
              type="time"
              value={dateForm.endTime}
              onChange={(e) =>
                setDateForm((v) => ({ ...v, endTime: e.target.value }))
              }
            />
            <label className="text-sm">
              <input
                checked={dateForm.isClosed}
                onChange={(e) =>
                  setDateForm((v) => ({ ...v, isClosed: e.target.checked }))
                }
                type="checkbox"
              />{" "}
              Closed
            </label>
            <Button
              disabled={!dateForm.date || setDate.isPending}
              onClick={() =>
                setDate.mutate({
                  date: dateForm.date,
                  input: {
                    startTime: dateForm.startTime,
                    endTime: dateForm.endTime,
                    isClosed: dateForm.isClosed,
                  },
                })
              }
            >
              Save override
            </Button>
            {dates.data.map((d) => (
              <p className="text-sm" key={d.id}>
                {String(d.date).slice(0, 10)}{" "}
                {d.isClosed ? "Closed" : `${d.startTime}-${d.endTime}`}{" "}
                <button
                  className="text-[var(--color-primary)]"
                  onClick={() => deleteDate.mutate(String(d.date).slice(0, 10))}
                >
                  Delete
                </button>
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocked time</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              type="datetime-local"
              value={blockedForm.startAt}
              onChange={(e) =>
                setBlockedForm((v) => ({ ...v, startAt: e.target.value }))
              }
            />
            <Input
              type="datetime-local"
              value={blockedForm.endAt}
              onChange={(e) =>
                setBlockedForm((v) => ({ ...v, endAt: e.target.value }))
              }
            />
            <Input
              placeholder="Reason"
              value={blockedForm.reason}
              onChange={(e) =>
                setBlockedForm((v) => ({ ...v, reason: e.target.value }))
              }
            />
            <Button
              disabled={
                !blockedForm.startAt ||
                !blockedForm.endAt ||
                createBlocked.isPending
              }
              onClick={() =>
                createBlocked.mutate({
                  startAt: new Date(blockedForm.startAt).toISOString(),
                  endAt: new Date(blockedForm.endAt).toISOString(),
                  reason: blockedForm.reason || undefined,
                })
              }
            >
              Add blocked time
            </Button>
            {blocked.data.map((b) => (
              <p className="text-sm" key={b.id}>
                {new Date(b.startAt).toLocaleString()}{" "}
                <button
                  className="text-[var(--color-primary)]"
                  onClick={() => deleteBlocked.mutate(b.id)}
                >
                  Delete
                </button>
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Holidays</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              type="date"
              value={holidayForm.date}
              onChange={(e) =>
                setHolidayForm((v) => ({ ...v, date: e.target.value }))
              }
            />
            <Input
              placeholder="Label"
              value={holidayForm.label}
              onChange={(e) =>
                setHolidayForm((v) => ({ ...v, label: e.target.value }))
              }
            />
            <Button
              disabled={!holidayForm.date || createHoliday.isPending}
              onClick={() =>
                createHoliday.mutate({
                  date: holidayForm.date,
                  label: holidayForm.label || undefined,
                })
              }
            >
              Add holiday
            </Button>
            {holidays.data.map((h) => (
              <p className="text-sm" key={h.id}>
                {String(h.date).slice(0, 10)} {h.label}{" "}
                <button
                  className="text-[var(--color-primary)]"
                  onClick={() => deleteHoliday.mutate(h.id)}
                >
                  Delete
                </button>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

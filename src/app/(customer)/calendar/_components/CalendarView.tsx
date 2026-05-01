"use client";

import { useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  location: string;
  status: string;
  totalPriceCents: number;
  participantCount: number;
  dateKey: string; // "YYYY-MM-DD"
  timeLabel: string;
  timezone: string;
}

const STATUS_CHIP: Record<string, string> = {
  CONFIRMED:     "bg-ds-secondary/10 text-ds-secondary",
  COMPLETED:     "bg-ds-surface-container text-ds-on-surface-variant",
  RESERVED_HOLD: "bg-amber-100 text-amber-700",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatCents(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build a map of dateKey → events
  const eventMap = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = eventMap.get(e.dateKey) ?? [];
    list.push(e);
    eventMap.set(e.dateKey, list);
  }

  // Calendar grid helpers
  const firstDay = new Date(year, month, 1);
  // getDay(): 0=Sun, 1=Mon ... 6=Sat — shift so Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedEvents = selectedDate ? (eventMap.get(selectedDate) ?? []) : [];

  return (
    <div className="flex gap-6">
      {/* Calendar grid */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-ds-lg border border-ds-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ds-outline-variant">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-ds hover:bg-ds-surface-container-low transition-colors text-ds-on-surface-variant hover:text-ds-on-surface"
            >
              <span className="material-symbols-outlined text-title-sm">chevron_left</span>
            </button>
            <h2 className="type-title-sm text-ds-on-surface">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-ds hover:bg-ds-surface-container-low transition-colors text-ds-on-surface-variant hover:text-ds-on-surface"
            >
              <span className="material-symbols-outlined text-title-sm">chevron_right</span>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-ds-outline-variant">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center type-label-caps text-ds-on-surface-variant">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startOffset + 1;
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const dateKey = isCurrentMonth
                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                : null;

              const hasEvents = dateKey ? eventMap.has(dateKey) : false;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;

              return (
                <button
                  key={i}
                  disabled={!isCurrentMonth}
                  onClick={() => {
                    if (!dateKey) return;
                    setSelectedDate(isSelected ? null : dateKey);
                  }}
                  className={`relative min-h-[64px] p-2 border-b border-r border-ds-outline-variant text-left transition-colors focus:outline-none
                    ${!isCurrentMonth ? "bg-ds-surface-container-low/50" : ""}
                    ${isSelected ? "bg-ds-secondary/5 border-ds-secondary/20" : ""}
                    ${isCurrentMonth && !isSelected ? "hover:bg-ds-surface-container-low" : ""}
                  `}
                >
                  {isCurrentMonth && (
                    <>
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full type-body-sm font-medium
                          ${isToday ? "bg-ds-secondary text-ds-on-secondary" : isSelected ? "text-ds-secondary font-bold" : "text-ds-on-surface"}
                        `}
                      >
                        {dayNum}
                      </span>
                      {hasEvents && (
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {(eventMap.get(dateKey!) ?? []).slice(0, 3).map((e) => (
                            <span
                              key={e.id}
                              className={`w-1.5 h-1.5 rounded-full ${e.status === "CONFIRMED" ? "bg-ds-secondary" : "bg-ds-outline"}`}
                            />
                          ))}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ds-secondary inline-block" />
            <span className="type-body-sm text-ds-on-surface-variant">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ds-outline inline-block" />
            <span className="type-body-sm text-ds-on-surface-variant">Other</span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside className="w-72 shrink-0">
        {selectedDate && selectedEvents.length > 0 ? (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="px-4 py-3 border-b border-ds-outline-variant">
              <p className="type-label-caps text-ds-on-surface-variant">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("de-DE", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </p>
            </div>
            <div className="divide-y divide-ds-outline-variant">
              {selectedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/bookings/${e.id}/thank-you`}
                  className="block px-4 py-3 hover:bg-ds-surface-container-low transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="type-body-sm font-semibold text-ds-on-surface leading-snug">{e.title}</p>
                    <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full type-label-caps ${STATUS_CHIP[e.status] ?? "bg-ds-surface-container text-ds-on-surface-variant"}`}>
                      {e.status === "CONFIRMED" ? "Confirmed" : e.status === "RESERVED_HOLD" ? "Pending" : "Completed"}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="type-body-sm text-ds-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {e.timeLabel}
                    </p>
                    <p className="type-body-sm text-ds-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {e.location}
                    </p>
                    <p className="type-body-sm text-ds-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">group</span>
                      {e.participantCount} participant{e.participantCount !== 1 ? "s" : ""} · {formatCents(e.totalPriceCents)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : selectedDate ? (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <span className="material-symbols-outlined text-3xl text-ds-outline mb-2 block">event_available</span>
            <p className="type-body-sm text-ds-on-surface-variant">No bookings on this day</p>
          </div>
        ) : (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant p-6 text-center shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <span className="material-symbols-outlined text-3xl text-ds-outline mb-2 block">touch_app</span>
            <p className="type-body-sm text-ds-on-surface-variant">Select a day to see bookings</p>
          </div>
        )}

        {/* Upcoming list */}
        {events.length > 0 && (
          <div className="mt-4 bg-white rounded-ds-lg border border-ds-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="px-4 py-3 border-b border-ds-outline-variant">
              <p className="type-label-caps text-ds-on-surface-variant">Upcoming</p>
            </div>
            <div className="divide-y divide-ds-outline-variant max-h-64 overflow-y-auto">
              {events
                .filter((e) => e.dateKey >= todayKey)
                .slice(0, 8)
                .map((e) => (
                  <Link
                    key={e.id}
                    href={`/bookings/${e.id}/thank-you`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-ds-surface-container-low transition-colors"
                  >
                    <div className="w-8 h-8 rounded-ds bg-ds-secondary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-ds-secondary" style={{ fontSize: 16 }}>event</span>
                    </div>
                    <div className="min-w-0">
                      <p className="type-body-sm font-medium text-ds-on-surface truncate">{e.title}</p>
                      <p className="type-body-sm text-ds-on-surface-variant">{e.dateKey} · {e.timeLabel}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

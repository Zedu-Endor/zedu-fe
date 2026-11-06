"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ReminderNotification } from "~/types/reminder";

export const REMINDER_POPUP_MS = 10000;

type ReminderPopupProps = {
  reminder: ReminderNotification;
  onOpen: (reminder: ReminderNotification) => void;
  onDismiss: (reminderId: string) => void;
};

const ReminderPopup = ({ reminder, onOpen, onDismiss }: ReminderPopupProps) => {
  // Drives the depleting bar: starts full, then transitions to empty.
  const [depleted, setDepleted] = useState(false);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDepleted(true));
    const timer = setTimeout(
      () => dismissRef.current(reminder.reminder_id),
      REMINDER_POPUP_MS
    );

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [reminder.reminder_id]);

  const navigable = reminder.available;

  return (
    <div
      className={cn(
        "w-[320px] overflow-hidden rounded-lg border border-[#E6EAEF] bg-white shadow-lg",
        "animate-in slide-in-from-right-4 fade-in duration-300",
        navigable && "cursor-pointer hover:border-blue-300"
      )}
      onClick={navigable ? () => onOpen(reminder) : undefined}
      role={navigable ? "button" : "status"}
      aria-label={
        navigable
          ? `Reminder from ${reminder.channel_name}`
          : "Reminder, message no longer available"
      }
    >
      <div className="flex items-start gap-3 p-4">
        <span className="mt-[2px] rounded-full bg-blue-100 p-[6px]">
          <Bell size={14} className="text-blue-500" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-gray-900">
              Reminder
              {reminder.channel_name ? ` · #${reminder.channel_name}` : ""}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(reminder.reminder_id);
              }}
              className="rounded p-1 text-[#667085] hover:bg-gray-100"
              aria-label="Dismiss reminder"
            >
              <X size={14} />
            </button>
          </div>

          {navigable ? (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {reminder.content}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-gray-500">
              This message is no longer available.
            </p>
          )}
        </div>
      </div>

      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-full bg-blue-500"
          style={{
            width: depleted ? "0%" : "100%",
            transition: `width ${REMINDER_POPUP_MS}ms linear`,
          }}
        />
      </div>
    </div>
  );
};

export default ReminderPopup;

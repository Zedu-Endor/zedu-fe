"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
} from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import Image from "next/image";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showError, showSuccess } from "~/components/toast/sonner";
import { deleteReminder, listReminders } from "~/lib/reminders/api";
import {
  resolveNotificationRoute,
  storeMessageHighlightId,
} from "~/lib/onesignal/notification-route";
import DeleteReminderDialog from "../_components/reminders/delete-reminder-dialog";
import type { Reminder } from "~/types/reminder";

/**
 * `remind_at` comes back as `...Z` from POST and `...+01:00` from GET — the
 * same instant rendered differently, so it is parsed, never compared as text.
 */
const parseRemindAt = (remindAt: string): Date | null => {
  const date = new Date(remindAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRemindAt = (date: Date): string => {
  const time = format(date, "h:mm a");
  if (isToday(date)) return `Today, ${time}`;
  if (isTomorrow(date)) return `Tomorrow, ${time}`;
  return format(date, "EEE, MMM d, h:mm a");
};

/** "in 30 min" / "in 1 hour" alongside the absolute time, as in the design. */
const formatLeadTime = (date: Date): string => {
  if (date.getTime() <= Date.now()) return "due now";
  return `in ${formatDistanceToNowStrict(date)}`;
};

const Reminders = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { orgId, orgSlug } = state;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Reminder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReminders = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    const result = await listReminders(String(orgId));
    if (result.ok) {
      setReminders(result.data);
      dispatch({ type: ACTIONS.REMINDERS_COUNT, payload: result.data.length });
    }
    setLoading(false);
  }, [dispatch, orgId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);

    const result = await deleteReminder(String(orgId), pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);

    if (result.ok) {
      setReminders((current) => {
        const next = current.filter(
          (reminder) => reminder.id !== pendingDelete.id
        );
        dispatch({ type: ACTIONS.REMINDERS_COUNT, payload: next.length });
        return next;
      });
      showSuccess("Reminder deleted");
      return;
    }

    // Already gone or never theirs — the list is stale either way.
    if (result.status === 404) {
      showError("That reminder no longer exists");
      fetchReminders();
      return;
    }

    showError("Couldn't delete the reminder", "Please try again.");
  };

  const handleOpen = (reminder: Reminder) => {
    const route = resolveNotificationRoute(
      {
        notification_type: "message_reminder",
        section:
          reminder.type === "message" ? "reply_message" : "thread_message",
        channels_id: reminder.channels_id,
        thread_id: reminder.thread_id,
        message_id: reminder.message_id,
      },
      null,
      orgSlug
    );

    if (!route) return;
    storeMessageHighlightId({
      thread_id: reminder.thread_id,
      message_id: reminder.message_id,
    });
    router.push(route);
  };

  return (
    <div className="mt-[60px] h-[calc(100dvh-60px)] overflow-y-auto bg-white">
      <div className="mx-auto w-full max-w-[720px] px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My reminders</h1>
            <p className="mt-1 text-sm text-gray-500">Soonest first</p>
          </div>
          {!loading && reminders.length > 0 && (
            <span className="shrink-0 pt-1 text-sm text-gray-500">
              {reminders.length} upcoming
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-[108px] animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center">
            <Image
              src="/image/empty-message.svg"
              width={100}
              height={100}
              className="size-24"
              alt=""
              unoptimized
            />
            <h2 className="mt-4 text-lg font-bold text-blue-500">
              No reminders yet
            </h2>
            <p className="mt-1 max-w-[320px] text-center text-sm text-gray-500">
              Pick <span className="font-medium">Remind me about this</span>{" "}
              from a message&apos;s menu and it will show up here.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {reminders.map((reminder) => {
              const date = parseRemindAt(reminder.remind_at);

              return (
                <li
                  key={reminder.id}
                  className="rounded-lg border border-[#E6EAEF] p-4 hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => handleOpen(reminder)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Clock size={15} className="text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">
                          {date ? formatRemindAt(date) : ""}
                        </span>
                        {date && (
                          <span className="text-xs text-gray-500">
                            {formatLeadTime(date)}
                          </span>
                        )}
                      </div>

                      {reminder.channel_name && (
                        <p className="mt-2 text-sm text-gray-500">
                          #{reminder.channel_name}
                        </p>
                      )}

                      {reminder.content && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                          {reminder.author_name && (
                            <span className="font-semibold text-gray-900">
                              {reminder.author_name}:{" "}
                            </span>
                          )}
                          {reminder.content}
                        </p>
                      )}
                    </button>

                    <button
                      aria-label="Delete reminder"
                      onClick={() => setPendingDelete(reminder)}
                      className="shrink-0 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DeleteReminderDialog
        reminder={pendingDelete}
        deleting={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Reminders;

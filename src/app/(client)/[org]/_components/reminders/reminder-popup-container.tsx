"use client";

import { useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import {
  resolveNotificationRoute,
  storeMessageHighlightId,
} from "~/lib/onesignal/notification-route";
import ReminderPopup from "./reminder-popup";
import type { ReminderNotification } from "~/types/reminder";

export default function ReminderPopupContainer() {
  const router = useRouter();
  const { state, dispatch } = useContext(DataContext);
  const { reminderPopups, orgSlug } = state;

  const handleDismiss = useCallback(
    (reminderId: string) => {
      dispatch({ type: ACTIONS.DISMISS_REMINDER_POPUP, payload: reminderId });
    },
    [dispatch]
  );

  const handleOpen = useCallback(
    (reminder: ReminderNotification) => {
      const payload = {
        notification_type: "message_reminder",
        section:
          reminder.type === "message" ? "reply_message" : "thread_message",
        channels_id: reminder.channels_id,
        thread_id: reminder.thread_id,
        message_id: reminder.message_id,
      };

      const route = resolveNotificationRoute(payload, null, orgSlug);
      handleDismiss(reminder.reminder_id);

      if (route) {
        storeMessageHighlightId(payload);
        router.push(route);
      }
    },
    [handleDismiss, orgSlug, router]
  );

  if (!reminderPopups?.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3 sm:right-6 sm:top-6">
      {reminderPopups.map((reminder: ReminderNotification) => (
        <ReminderPopup
          key={reminder.reminder_id}
          reminder={reminder}
          onOpen={handleOpen}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

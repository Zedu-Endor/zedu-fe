"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { Reminder } from "~/types/reminder";

type DeleteReminderDialogProps = {
  /** The reminder awaiting confirmation; `null` keeps the dialog closed. */
  reminder: Reminder | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const formatRemindAt = (remindAt: string): string => {
  const date = new Date(remindAt);
  if (Number.isNaN(date.getTime())) return "";

  const time = format(date, "h:mm a");
  if (isToday(date)) return `Today, ${time}`;
  if (isTomorrow(date)) return `Tomorrow, ${time}`;
  return format(date, "EEE, MMM d, h:mm a");
};

const DeleteReminderDialog = ({
  reminder,
  deleting,
  onCancel,
  onConfirm,
}: DeleteReminderDialogProps) => (
  <AlertDialog
    open={Boolean(reminder)}
    onOpenChange={(open) => {
      if (!open) onCancel();
    }}
  >
    <AlertDialogContent className="max-w-[420px]">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
        <AlertDialogDescription>
          You won&apos;t be reminded about this message. This can&apos;t be
          undone.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {reminder && (
        <div className="rounded-lg border border-[#E6EAEF] bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">
              {formatRemindAt(reminder.remind_at)}
            </span>
          </div>

          {reminder.content ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-700">
              {reminder.author_name && (
                <span className="font-semibold text-gray-900">
                  {reminder.author_name}
                </span>
              )}
              {reminder.channel_name && (
                <span> in #{reminder.channel_name}</span>
              )}
              : {reminder.content}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              {reminder.type === "message" ? "Reply" : "Message"}
              {reminder.channel_name ? ` in #${reminder.channel_name}` : ""}
            </p>
          )}
        </div>
      )}

      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          disabled={deleting}
          onClick={(e) => {
            e.preventDefault();
            onConfirm();
          }}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          {deleting ? "Deleting…" : "Delete reminder"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteReminderDialog;

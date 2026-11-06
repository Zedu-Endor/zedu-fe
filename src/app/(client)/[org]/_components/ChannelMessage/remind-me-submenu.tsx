import React, { useContext, useState } from "react";
import { Clock } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { showError, showSuccess } from "~/components/toast/sonner";
import { createReminder } from "~/lib/reminders/api";
import { REMINDER_PRESETS, tzOffsetMinutes } from "~/lib/reminders/presets";
import type { ReminderPreset, ReminderType } from "~/types/reminder";

type RemindMeSubmenuProps = {
  channelsId?: string;
  threadId?: string;
  /** Required by the API when `type` is `"message"`. */
  messageId?: string;
  type: ReminderType;
  onDone: () => void;
};

const rowClass =
  "group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer";

const RemindMeSubmenu = ({
  channelsId,
  threadId,
  messageId,
  type,
  onDone,
}: RemindMeSubmenuProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { orgId } = state;

  // Every route is organisation-scoped, and a reply needs its own message id.
  const canRemind = Boolean(
    orgId && channelsId && threadId && (type !== "message" || messageId)
  );

  const handlePreset = async (preset: ReminderPreset) => {
    if (!canRemind || saving) return;
    setSaving(true);

    const result = await createReminder(String(orgId), {
      channels_id: String(channelsId),
      thread_id: String(threadId),
      ...(type === "message" ? { message_id: String(messageId) } : {}),
      type,
      preset,
      tz_offset_minutes: tzOffsetMinutes(),
    });

    setSaving(false);

    if (result.ok) {
      showSuccess(
        "Reminder set",
        REMINDER_PRESETS.find((option) => option.preset === preset)?.label
      );
      dispatch({ type: ACTIONS.REMINDERS_CALLBACK });
    } else if (result.status === 403) {
      showError("You can't set a reminder here");
    } else {
      showError(
        "Couldn't set the reminder",
        "Nothing was saved. Check your connection and try again."
      );
    }

    setOpen(false);
    onDone();
  };

  if (!canRemind) return null;

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((previous) => !previous);
        }}
        className={rowClass}
        role="button"
        aria-expanded={open}
        aria-label="Remind me about this"
      >
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>Remind me about this</span>
        </div>
        <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
          {">"}
        </span>
      </div>

      {open &&
        REMINDER_PRESETS.map((option) => (
          <div
            key={option.preset}
            onClick={(e) => {
              e.stopPropagation();
              handlePreset(option.preset);
            }}
            className={`${rowClass} pl-10 ${saving ? "pointer-events-none opacity-60" : ""}`}
            role="button"
          >
            <span>{option.label}</span>
          </div>
        ))}

      <hr />
    </>
  );
};

export default RemindMeSubmenu;

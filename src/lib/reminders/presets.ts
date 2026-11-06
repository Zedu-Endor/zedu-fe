import type { ReminderPreset } from "~/types/reminder";

export const REMINDER_PRESETS: { preset: ReminderPreset; label: string }[] = [
  { preset: "30_min", label: "In 30 minutes" },
  { preset: "1_hour", label: "In 1 hour" },
  { preset: "tomorrow_9am", label: "Tomorrow at 9 AM" },
];

export const presetLabel = (preset: ReminderPreset): string =>
  REMINDER_PRESETS.find((option) => option.preset === preset)?.label || "";

/**
 * Minutes east of UTC, which is the opposite sign of `getTimezoneOffset()`.
 * The server only applies it to `tomorrow_9am`, but it is always sent —
 * omitting it would schedule 09:00 UTC, the wrong morning for most users.
 */
export const tzOffsetMinutes = (): number => -new Date().getTimezoneOffset();

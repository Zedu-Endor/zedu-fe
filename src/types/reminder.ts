export type ReminderPreset = "30_min" | "1_hour" | "tomorrow_9am";

export type ReminderType = "thread" | "message";

export type Reminder = {
  id: string;
  channels_id: string;
  thread_id: string;
  message_id: string | null;
  type: ReminderType;
  preset: ReminderPreset;
  remind_at: string;
  created_at: string;
  /**
   * The design shows the channel, author and message text on each row, but the
   * list endpoint does not return them yet — the fired-reminder payload does.
   * Optional so the page renders today and fills in when the API catches up.
   */
  channel_name?: string;
  author_name?: string;
  content?: string;
};

export type CreateReminderPayload = {
  channels_id: string;
  thread_id: string;
  message_id?: string;
  type: ReminderType;
  preset: ReminderPreset;
  tz_offset_minutes: number;
};

/** `data` of a `message_reminder` Centrifugo publication. */
export type ReminderNotification = {
  reminder_id: string;
  channels_id: string;
  channel_name: string;
  thread_id: string;
  message_id: string | null;
  type: ReminderType;
  content: string | null;
  available: boolean;
};

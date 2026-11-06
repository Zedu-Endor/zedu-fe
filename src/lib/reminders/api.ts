import { DeleteRequest, GetRequest, PostRequest } from "~/utils/new-request";
import type { CreateReminderPayload, Reminder } from "~/types/reminder";

/**
 * The helpers in `new-request` resolve with the axios response on success and
 * with the axios error on failure, so the status lives in one of two places.
 */
const statusOf = (res: any): number =>
  Number(res?.status ?? res?.response?.status ?? 0);

const isOk = (res: any): boolean => {
  const status = statusOf(res);
  return status === 200 || status === 201;
};

const remindersPath = (orgId: string) =>
  `/organisations/${orgId}/reminders` as const;

export type ReminderResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number };

export const createReminder = async (
  orgId: string,
  payload: CreateReminderPayload
): Promise<ReminderResult<Reminder>> => {
  const res = await PostRequest(remindersPath(orgId), payload);
  if (!isOk(res)) return { ok: false, status: statusOf(res) };
  return { ok: true, data: res?.data?.data as Reminder };
};

/** Already sorted by `remind_at` ascending; an empty array is a valid state. */
export const listReminders = async (
  orgId: string
): Promise<ReminderResult<Reminder[]>> => {
  const res = await GetRequest(remindersPath(orgId));
  if (!isOk(res)) return { ok: false, status: statusOf(res) };
  const data = res?.data?.data;
  return { ok: true, data: Array.isArray(data) ? (data as Reminder[]) : [] };
};

export const deleteReminder = async (
  orgId: string,
  reminderId: string
): Promise<ReminderResult<null>> => {
  const res = await DeleteRequest(`${remindersPath(orgId)}/${reminderId}`);
  if (!isOk(res)) return { ok: false, status: statusOf(res) };
  return { ok: true, data: null };
};

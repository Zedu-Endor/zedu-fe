"use client";

import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { listReminders } from "~/lib/reminders/api";

/**
 * Keeps the sidebar's upcoming-reminder badge in sync. Refetches whenever
 * `remindersCallback` is toggled — on create, delete, or a reminder firing,
 * since a fired reminder drops off the list.
 */
export const useRemindersCount = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, remindersCallback } = state;

  useEffect(() => {
    if (!orgId) return;
    let active = true;

    (async () => {
      const result = await listReminders(String(orgId));
      if (active && result.ok) {
        dispatch({
          type: ACTIONS.REMINDERS_COUNT,
          payload: result.data.length,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [dispatch, orgId, remindersCallback]);
};

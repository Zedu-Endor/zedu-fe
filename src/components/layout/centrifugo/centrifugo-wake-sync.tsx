"use client";

import { useEffect, useRef } from "react";
import { ensureCentrifugeConnected } from "~/lib/centrifugo/ensure-connected";

const RESYNC_DEBOUNCE_MS = 800;

/**
 * When the tab wakes, Centrifugo may have been suspended by the browser.
 * Only reconnect the socket here — do NOT trigger CHANNEL_LOADING /
 * TRIGGER_CALLBACK refetches, which blank the chat UI (home layout returns
 * null while channelLoading is true).
 */
export default function CentrifugoWakeSync() {
  const lastSyncAtRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const reconnect = () => {
      const now = Date.now();
      if (now - lastSyncAtRef.current < RESYNC_DEBOUNCE_MS) return;
      lastSyncAtRef.current = now;
      ensureCentrifugeConnected(true);
    };

    const scheduleReconnect = (immediate = false) => {
      if (timer) clearTimeout(timer);
      if (immediate) {
        reconnect();
      } else {
        timer = setTimeout(reconnect, RESYNC_DEBOUNCE_MS);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleReconnect(true);
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      // Only force reconnect after bfcache restore; normal shows are
      // already covered by visibilitychange.
      if (event.persisted) {
        scheduleReconnect(true);
      }
    };

    const onOnline = () => scheduleReconnect(true);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onOnline);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}

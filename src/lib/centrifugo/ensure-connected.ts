import { getSharedCentrifuge } from "~/lib/centrifugo/shared-centrifuge";

/** Reconnect the shared Centrifugo client if it dropped while the tab slept. */
export function ensureCentrifugeConnected(force = false): void {
  if (typeof window === "undefined") return;

  try {
    const client = getSharedCentrifuge();
    const state = client.state;

    if (force) {
      if (state === "connected") return;
      // connect() is a no-op while connecting; restart so wake/push skip backoff.
      if (state === "connecting") {
        client.disconnect();
      }
      client.connect();
      return;
    }

    if (state !== "connected" && state !== "connecting") {
      client.connect();
    }
  } catch {
    // Token / env may not be ready yet — ignore
  }
}

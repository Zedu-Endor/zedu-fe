const activeNotifications = new Map<string, Notification>();

export function showCallNotification(params: {
  callerName: string;
  avatarUrl?: string;
  buzzId: string;
}): void {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    document.visibilityState === "visible"
  ) {
    return;
  }

  try {
    const key = params.buzzId || "default";
    const previous = activeNotifications.get(key);
    if (previous) {
      try {
        previous.close();
      } catch {
        // Ignore close errors
      }
    }

    const notif = new Notification(`${params.callerName} is buzzing you!`, {
      body: "Click to join the buzz",
      icon: typeof params.avatarUrl === "string" ? params.avatarUrl : undefined,
      tag: params.buzzId ? `buzz-${params.buzzId}` : "buzz-call",
      requireInteraction: true,
    });

    activeNotifications.set(key, notif);

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (activeNotifications.get(key) === notif) {
        activeNotifications.delete(key);
      }
    };

    notif.onclose = () => {
      if (activeNotifications.get(key) === notif) {
        activeNotifications.delete(key);
      }
    };
  } catch {
    // Ignore browser notification errors
  }
}

export function closeCallNotification(buzzId?: string): void {
  // A supplied ID (including empty/unknown) must not fall through to bulk close.
  if (arguments.length >= 1) {
    if (!buzzId || !activeNotifications.has(buzzId)) return;
    try {
      activeNotifications.get(buzzId)?.close();
    } catch {
      // Ignore close errors
    }
    activeNotifications.delete(buzzId);
    return;
  }

  activeNotifications.forEach((notif) => {
    try {
      notif.close();
    } catch {
      // Ignore close errors
    }
  });
  activeNotifications.clear();
}

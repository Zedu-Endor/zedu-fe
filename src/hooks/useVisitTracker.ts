"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageVisitsWebhook } from "~/utils/webhook-request";
import { ipifyUrl } from "~/lib/env-urls";

const TWO_HOURS = 2 * 60 * 60 * 1000;

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore quota exceeded or storage disabled in restricted environments
    }
  },
};

const getVisitorId = (): string => {
  let id = safeLocalStorage.getItem("visitor_id");
  if (!id) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      id = crypto.randomUUID();
    } else {
      id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    safeLocalStorage.setItem("visitor_id", id);
  }
  return id;
};

const getLastVisit = (): number | null => {
  const value = safeLocalStorage.getItem("last_visit_time");
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const setLastVisit = (time: number) => {
  safeLocalStorage.setItem("last_visit_time", time.toString());
};

const getStoredUser = (): { username?: string; email?: string } | null => {
  const userData = safeLocalStorage.getItem("user");
  if (!userData) return null;
  try {
    const parsed = JSON.parse(userData);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

export const useVisitTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const user = getStoredUser();
        const username = user?.username || user?.email || `guest_${visitorId}`;
        const now = Date.now();
        const lastVisit = getLastVisit();
        const fullVisitAllowed = !lastVisit || now - lastVisit > TWO_HOURS;

        const event_name = fullVisitAllowed ? "visit" : "page_view";
        const status = "success";

        // Collect extended metadata
        const ip = await fetch(ipifyUrl())
          .then((res) => res.json())
          .then((data) => data.ip)
          .catch(() => "unknown");

        const message = `
                    🔹 URL: ${window.location.href}\n
                    🔹 Path: ${pathname}\n
                    🔹 Username: ${username}\n
                    🔹 Browser: ${navigator.userAgent}\n
                    🔹 Referrer: ${document.referrer || "Direct visit"}\n
                    🔹 IP: ${ip}\n
                    🔹 Visitor ID: ${visitorId}\n
                    `;

        await PageVisitsWebhook(username, event_name, message.trim(), status);

        if (fullVisitAllowed) setLastVisit(now);
      } catch (err) {
        console.error("Visit tracking failed:", err);
      }
    };

    trackVisit();
  }, [pathname]);
};

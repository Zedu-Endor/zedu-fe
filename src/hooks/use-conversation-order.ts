"use client";

import { useCallback, useEffect, useState } from "react";

const THREAD_ORDER_KEY = "zedu_thread_newest_at_top";
const CONVERSATION_ORDER_KEY = "zedu_conversation_newest_at_top";

export function useThreadOrder() {
  const [isNewestAtTop, setIsNewestAtTop] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem(THREAD_ORDER_KEY);
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THREAD_ORDER_KEY && e.newValue !== null) {
        setIsNewestAtTop(e.newValue === "true");
      }
    };
    const handleCustom = () => {
      const saved = localStorage.getItem(THREAD_ORDER_KEY);
      if (saved !== null) setIsNewestAtTop(saved === "true");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("zedu_thread_order_changed", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("zedu_thread_order_changed", handleCustom);
    };
  }, []);

  const toggleOrder = useCallback(() => {
    setIsNewestAtTop((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(THREAD_ORDER_KEY, String(next));
        window.dispatchEvent(new Event("zedu_thread_order_changed"));
      }
      return next;
    });
  }, []);

  return { isNewestAtTop, toggleOrder };
}

export function useConversationOrder() {
  const [isNewestAtTop, setIsNewestAtTop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(CONVERSATION_ORDER_KEY);
    return saved === "true";
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONVERSATION_ORDER_KEY && e.newValue !== null) {
        setIsNewestAtTop(e.newValue === "true");
      }
    };
    const handleCustom = () => {
      const saved = localStorage.getItem(CONVERSATION_ORDER_KEY);
      if (saved !== null) setIsNewestAtTop(saved === "true");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("zedu_conv_order_changed", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("zedu_conv_order_changed", handleCustom);
    };
  }, []);

  const toggleOrder = useCallback(() => {
    setIsNewestAtTop((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(CONVERSATION_ORDER_KEY, String(next));
        window.dispatchEvent(new Event("zedu_conv_order_changed"));
      }
      return next;
    });
  }, []);

  return { isNewestAtTop, toggleOrder };
}

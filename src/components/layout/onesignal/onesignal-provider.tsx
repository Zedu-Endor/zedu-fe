"use client";

import { useContext, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import OneSignal from "react-onesignal";
import { initOneSignalSafely } from "~/lib/onesignal/init";
import {
  normalizeNotificationPayload,
  resolveNotificationRoute,
  storeMessageHighlightId,
} from "~/lib/onesignal/notification-route";
import {
  registerNotificationBadge,
  isHomeRoute,
} from "~/lib/notifications/notification-badge";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { openBuzzInNewTab } from "~/lib/buzz/open-buzz-tab";
import { ensureCentrifugeConnected } from "~/lib/centrifugo/ensure-connected";
import images from "~/assets/images";
import { closeCallNotification } from "~/lib/notifications/call-notification";

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const isMessageLikeNotification = (data: Record<string, unknown>) => {
  const type = (
    getString(data.notification_type) ||
    getString(data.event) ||
    ""
  ).toLowerCase();

  if (
    type === "new_message" ||
    type === "dm" ||
    type === "mention" ||
    type === "channel" ||
    type.includes("message") ||
    type.includes("buzz") ||
    type.includes("call")
  ) {
    return true;
  }

  return Boolean(
    getString(data.channel_id) ||
    getString(data.channels_id) ||
    getString(data.thread_id) ||
    getString(data.message_id) ||
    getString(data.buzz_id) ||
    getString(data.buzzId)
  );
};

const applyNotificationNavigationContext = (data: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  const orgId = getString(data.org_id);
  if (orgId) {
    localStorage.setItem("orgId", orgId);
  }

  const channelId = getString(data.channel_id) || getString(data.channels_id);
  if (channelId) {
    localStorage.setItem("channelId", channelId);
  }

  const channelName =
    getString(data.channel_name) || getString(data.sender_name);
  if (channelName) {
    localStorage.setItem("channelName", channelName);
  }
};

const getNotificationData = (notification: any) => {
  const additionalData = notification?.additionalData || {};
  const data = notification?.data || {};
  const customA = notification?.rawPayload?.custom?.a || {};

  return normalizeNotificationPayload({
    ...customA,
    ...data,
    ...additionalData,
  });
};

const navigateToNotificationTarget = (
  event: any,
  router: ReturnType<typeof useRouter>
) => {
  const notification = event?.notification;
  const data = getNotificationData(notification);
  applyNotificationNavigationContext(data);

  // Prefer payload IDs over OneSignal's generic launchURL (often "/" or "/{org}")
  const nextRoute = resolveNotificationRoute(
    data,
    notification?.launchURL || notification?.launchUrl
  );

  if (!nextRoute) return;

  storeMessageHighlightId(data);

  if (/\/buzz\/[^/]+$/.test(nextRoute)) {
    const [, orgSlug, , buzzId] = nextRoute.split("/");
    if (orgSlug && buzzId) {
      openBuzzInNewTab(orgSlug, buzzId);
      return;
    }
  }

  router.push(nextRoute);
};

export default function OneSignalProvider() {
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const context = useContext(DataContext);
  const dispatch = context?.dispatch;

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const incrementBadgeFromNotification = (notification: any) => {
    if (!dispatch || isHomeRoute(pathnameRef.current)) return;

    const payload = getNotificationData(notification);
    if (!registerNotificationBadge(payload)) return;

    dispatch({ type: ACTIONS.INCREMENT_NOTIFICATION_BADGE });
  };

  /** Catch up message lists when push arrives while Centrifugo was asleep. */
  const resyncMessagesFromPush = (data: Record<string, unknown>) => {
    if (!dispatch || !isMessageLikeNotification(data)) return;

    ensureCentrifugeConnected(true);
    dispatch({ type: ACTIONS.HOME_DMS_CALLBACK });
    dispatch({ type: ACTIONS.TRIGGER_CALLBACK });
  };

  useEffect(() => {
    if (!dispatch) return;

    let isActive = true;

    const handlePermissionChange = (permission: boolean) => {
      console.log("[OneSignal] Permission changed:", permission);
    };

    const handleForeground = (event: any) => {
      incrementBadgeFromNotification(event?.notification);

      const foregroundData = getNotificationData(event?.notification);
      resyncMessagesFromPush(foregroundData);

      const notifType = (
        getString(foregroundData?.notification_type) ||
        getString(foregroundData?.event) ||
        ""
      ).toLowerCase();

      const isCallInitiated =
        notifType === "direct_call_initiated" ||
        notifType === "direct_call_initialized" ||
        notifType === "incoming_call" ||
        notifType === "direct_call_incoming";

      const isCallCanceled =
        notifType === "direct_call_canceled" ||
        notifType === "direct_call_cancelled" ||
        notifType === "direct_call_cancel" ||
        notifType === "direct_call_ended";

      if (isCallInitiated) {
        const callerName =
          getString(foregroundData?.caller_name) ||
          getString(foregroundData?.callerName) ||
          getString(foregroundData?.sender_name) ||
          getString(foregroundData?.username) ||
          "Someone";
        const avatarUrl =
          getString(foregroundData?.avatar_url) ||
          getString(foregroundData?.avatarUrl) ||
          getString(foregroundData?.default_avatar_url) ||
          images.user;
        const channelId =
          getString(foregroundData?.channel_id) ||
          getString(foregroundData?.channelId) ||
          "";
        const buzzId =
          getString(foregroundData?.buzz_id) ||
          getString(foregroundData?.buzzId) ||
          getString(foregroundData?.buzz_code) ||
          "";
        const callerId =
          getString(foregroundData?.caller_id) ||
          getString(foregroundData?.callerId) ||
          getString(foregroundData?.sender_id) ||
          "";

        dispatch({
          type: ACTIONS.SHOW_INCOMING_CALL_POPUP,
          payload: {
            callerName,
            avatarUrl,
            channelId,
            buzzId,
            callerId,
          },
        });

        ensureCentrifugeConnected(true);

        if (audioPlayer.current) {
          audioPlayer.current.currentTime = 0;
          audioPlayer.current.play().catch(() => {
            console.log(
              "[OneSignal] Unable to autoplay ringtone without user interaction"
            );
          });
        }
      }

      if (isCallCanceled) {
        dispatch({ type: ACTIONS.HIDE_INCOMING_CALL_POPUP });
        const buzzId =
          getString(foregroundData?.buzz_id) ||
          getString(foregroundData?.buzzId) ||
          getString(foregroundData?.buzz_code) ||
          "";
        closeCallNotification(buzzId);
        if (audioPlayer.current) {
          audioPlayer.current.pause();
          audioPlayer.current.currentTime = 0;
        }
      }
    };

    const handleClick = (event: any) => {
      incrementBadgeFromNotification(event?.notification);
      const clickData = getNotificationData(event?.notification);
      resyncMessagesFromPush(clickData);
      // Remount may not run if already on the target conversation — refetch after nav
      window.setTimeout(() => resyncMessagesFromPush(clickData), 500);
      navigateToNotificationTarget(event, router);
    };

    const setup = async () => {
      try {
        await initOneSignalSafely();
        if (!isActive) return;

        if (Notification.permission === "default") {
          await OneSignal.Notifications.requestPermission();
        }

        OneSignal.Notifications.addEventListener(
          "permissionChange",
          handlePermissionChange
        );
        OneSignal.Notifications.addEventListener(
          "foregroundWillDisplay",
          handleForeground
        );
        OneSignal.Notifications.addEventListener("click", handleClick);
      } catch (error) {
        console.error("[OneSignal] Failed to initialize", error);
      }
    };

    setup();

    return () => {
      isActive = false;
      OneSignal.Notifications.removeEventListener(
        "permissionChange",
        handlePermissionChange
      );
      OneSignal.Notifications.removeEventListener(
        "foregroundWillDisplay",
        handleForeground
      );
      OneSignal.Notifications.removeEventListener("click", handleClick);
    };
  }, [dispatch, router]);

  return (
    <audio ref={audioPlayer} style={{ display: "none" }}>
      <source src="/audio/call-ringtone.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}

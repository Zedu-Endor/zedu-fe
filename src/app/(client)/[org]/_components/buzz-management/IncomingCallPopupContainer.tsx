import { useContext, useCallback, useState, useRef, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import IncomingCallPopup from "~/app/(client)/[org]/_components/buzz-management/IncomingCallPopup";
import { PostRequest } from "~/utils/new-request";
import { closeCallNotification } from "~/lib/notifications/call-notification";

export default function IncomingCallPopupContainer() {
  const [loading, setLoading] = useState(false);

  const { state, dispatch } = useContext(DataContext);
  const { user } = state;
  const show = state.showIncomingCallPopup;
  const callInfo = state?.incomingCallInfo;

  const callInfoRef = useRef(callInfo);
  useEffect(() => {
    callInfoRef.current = callInfo;
  }, [callInfo]);

  const handlePick = useCallback(async () => {
    const info = callInfoRef.current;
    if (!info) {
      return;
    }
    setLoading(true);

    const res = await PostRequest(`/buzz/${info.buzzId}/respond`, {
      action: "accept",
    });
    if (res?.status === 200 || res.status === 201) {
      const buzzId = res.data.data.buzz_code;

      const joinRes = await PostRequest(`/buzz/${buzzId}/join`);
      if (joinRes.status === 200 || joinRes.status === 201) {
        const buzzData = joinRes.data.data;

        const localUserAsParticipant = {
          user_id: user?.user_id,
          username: user?.username || "You",
          avatar_url: user?.avatar_url,
          audioTrack: null,
          videoTrack: null,
          handsRaised: false,
          isPinned: false,
          status: "active",
        };

        const participants = (buzzData.participants || []).map(
          (participant: any) => {
            if (participant?.user_id === user?.user_id) {
              return { ...participant, ...localUserAsParticipant };
            }
            return participant;
          }
        );

        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: participants,
        });
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: buzzData });
        dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });

        setLoading(false);
      }
      if (info.buzzId) closeCallNotification(info.buzzId);
      dispatch({ type: "HIDE_INCOMING_CALL_POPUP" });
    }
  }, [dispatch, user]);

  const handleDecline = useCallback(async () => {
    const info = callInfoRef.current;
    if (!info) return;
    if (info.buzzId) closeCallNotification(info.buzzId);
    await PostRequest(`/buzz/${info.buzzId}/respond`, { action: "decline" });
    dispatch({ type: "HIDE_INCOMING_CALL_POPUP" });
  }, [dispatch]);

  const handleTimeout = useCallback(async () => {
    // Notify backend of timeout
    const info = callInfoRef.current;
    if (info?.buzzId) {
      closeCallNotification(info.buzzId);
      try {
        await PostRequest(`/buzz/${info.buzzId}/respond`, {
          action: "timeout",
        });
      } catch (e) {
        // ignore
      }
    }
    dispatch({ type: "HIDE_INCOMING_CALL_POPUP" });
  }, [dispatch]);

  // Only show popup if user is NOT the caller
  const currentUserId = String(user?.user_id || user?.id || "");
  const callerId = String(callInfo?.callerId || "");
  if (!show || !callInfo || (currentUserId && currentUserId === callerId))
    return null;

  return (
    <IncomingCallPopup
      inviterName={callInfo.callerName}
      avatarUrl={callInfo.avatarUrl}
      channelName={callInfo.channelName}
      onAccept={handlePick}
      onDecline={handleDecline}
      onTimeout={handleTimeout}
      timeoutSeconds={60}
      loading={loading}
    />
  );
}

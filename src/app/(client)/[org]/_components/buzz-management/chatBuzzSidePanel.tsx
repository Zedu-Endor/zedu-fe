import {
  Hand,
  Loader,
  MessageCircleMore,
  Mic,
  MicOff,
  Minimize2,
  MonitorOff,
  ScreenShare,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import React, { useCallback, useContext, useState } from "react";

import HuddleEmojiReactions from "./HuddleEmojiReactions";
import Image from "next/image";
import { RaiseHandAnimation } from "~/components/raise-hand/raise-hand-animation";
import { ScrollArea } from "~/components/ui/scroll-area";
import { showInfo } from "~/components/toast/sonner";
import { ACTIONS } from "~/store/Actions";
import { Participant, useAgoraEvents } from "~/hooks/buzz";
import { DataContext } from "~/store/GlobalState";
import CallParticipantList from "./CallParticipantList";
import GeneralTimeout from "./general-timeout";
import BuzzTimeout from "./buzz-timeout";
import { useChannelBuzzContext } from "~/hooks/buzz/ChannelBuzzContext";
import { PostRequest } from "~/utils/new-request";

interface buzzSidePanelProps {
  onClose: () => void;
}

const ChatBuzzSidePanel: React.FC<buzzSidePanelProps> = ({ onClose }) => {
  const { state, dispatch } = useContext(DataContext);
  const { user, buzzParticipants, buzzView, buzzData } = state;

  const [showQuickEmojis, setShowQuickEmojis] = useState(false);
  const [showEndCallPopover, setShowEndCallPopover] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    videoTrack,
    screenVideoTrack,
    remoteScreenVideoTrack,
    isAudioPublishing,
    isVideoPublishing,
    isScreenSharing,
    joining,
    clientRef,
    screenShareClientRef,
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleChatSidebar,
    toggleHandRaise,
    handleLeave,
    handleEndBuzz,
    toggleFullPage,
  } = useChannelBuzzContext();

  const localParticipant = buzzParticipants?.find(
    (p: any) => p?.user_id === user?.user_id
  );
  const isHandRaised = localParticipant?.handsRaised ?? false;

  useAgoraEvents({
    user,
    clientRef,
    screenShareClientRef,
    isInitialized: true,
    data: buzzParticipants,
    setData: (val: any) => {
      const nextState = typeof val === "function" ? val(buzzParticipants) : val;
      dispatch({ type: ACTIONS.BUZZ_PARTICIPANTS, payload: nextState });
    },
    showInfo,
    setRemoteScreenVideoTrack,
    setRemoteScreenAudioTrack,
  });

  const handleMinimize = () => {
    dispatch({ type: ACTIONS.BUZZ_VIEW, payload: "pill" });
    dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: false });
  };

  const resetBuzzUiState = useCallback(() => {
    dispatch({ type: ACTIONS.BUZZ_VIEW, payload: "side" });
    dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: false });
    onClose?.();
  }, [dispatch, onClose]);

  const clearParticipants = () => {
    dispatch({ type: ACTIONS.BUZZ_PARTICIPANTS, payload: [] });
  };

  const handleTimeoutLeave = useCallback(async () => {
    await handleLeave();
    const isHost = Boolean(
      buzzData?.host_id &&
      (buzzData.host_id === user?.user_id || buzzData.host_id === user?.id)
    );
    if (isHost) {
      await handleEndBuzz();
    }
    clearParticipants();
    resetBuzzUiState();
  }, [
    buzzData?.host_id,
    user?.user_id,
    user?.id,
    handleLeave,
    handleEndBuzz,
    resetBuzzUiState,
  ]);

  const handleTimeoutEnd = useCallback(async () => {
    const isHost = Boolean(
      buzzData?.host_id &&
      (buzzData.host_id === user?.user_id || buzzData.host_id === user?.id)
    );
    if (isHost) {
      await handleEndBuzz();
    } else {
      await handleLeave();
    }
    clearParticipants();
    resetBuzzUiState();
  }, [
    buzzData?.host_id,
    user?.user_id,
    user?.id,
    handleEndBuzz,
    handleLeave,
    resetBuzzUiState,
  ]);

  // Cancel call before anyone joins (ringing)
  const handleCancelCall = useCallback(async () => {
    setLoading(true);
    try {
      await PostRequest(`/buzz/${buzzData?.buzz_id}/respond`, {
        action: "cancel",
      });
      await handleEndBuzz();
    } finally {
      setLoading(false);
    }
  }, [buzzData?.buzz_id, handleEndBuzz]);

  const handleMainCallEnd = () => {
    if (buzzParticipants?.length === 1) {
      handleEndBuzz();
    }

    if (buzzParticipants?.length > 1) {
      handleLeave();
    }

    const activeParticipants = buzzParticipants.filter(
      (p: Participant) => p.join_status === "accept"
    );
    const ringingParticipants = buzzParticipants.filter(
      (p: Participant) => p.join_status === "ringing"
    );

    // If I am the only one with accepted and everyone else is just ringing
    if (activeParticipants.length === 1 && ringingParticipants.length === 3) {
      handleCancelCall();
    }
  };

  if (joining)
    return (
      <div className="h-[calc(100dvh-60px)] flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse font-medium">
          <Loader size={20} className="mx-auto animate-spin" />
          Preparing your buzz...
        </div>
      </div>
    );

  return (
    <div
      className={`flex flex-col bg-white transition-all duration-300 pb-0 ${
        buzzView === "full"
          ? "fixed top-0 bottom-0 right-0 left-0 h-[calc(100dvh-24px)]"
          : "fixed top-16 inset-0 md:inset-none md:top-0 md:relative h-[calc(100dvh-80px)] w-full"
      }`}
      style={buzzView === "full" ? { zIndex: 40 } : { zIndex: 40 }}
    >
      <div className="flex flex-col gap-2 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Buzz Meeting Now
          </h2>
          <div className="flex items-center gap-3">
            <label className="hidden sm:inline-flex items-center gap-2 cursor-pointer group">
              <span className="text-sm font-medium text-gray-700">
                Full page
              </span>
              <div className=" relative">
                <input
                  type="checkbox"
                  checked={buzzView === "full"}
                  onChange={toggleFullPage}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#5F5FE1] transition-colors"></div>
                <div className="absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
            <button
              onClick={handleMinimize}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-md transition-colors"
              title="Minimize"
            >
              <Minimize2 size={18} className="text-gray-700" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
            <Users size={16} strokeWidth={2} />
            {buzzParticipants?.length || 0}{" "}
            {buzzParticipants?.length === 1 ? "participant" : "participants"}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
        </div>
      </div>

      <ScrollArea
        className={`flex-1 min-h-0 w-full relative ${
          buzzView === "full"
            ? "overflow-hidden px-4 py-4"
            : "overflow-auto p-4"
        }`}
      >
        {buzzParticipants && (
          <div className={buzzView === "full" ? "h-full" : "sm:mb-6"}>
            <div className={buzzView === "full" ? "h-full" : "md:p-3"}>
              <CallParticipantList
                isFullScreen={buzzView === "full"}
                chatScreenShareLayout={buzzView === "full"}
                data={buzzParticipants}
                localVideoTrack={videoTrack}
                localScreenTrack={screenVideoTrack}
                remoteScreenTrack={remoteScreenVideoTrack}
                isLocalScreenSharing={isScreenSharing}
              />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Control Bar at the bottom */}
      <div className="flex items-center justify-center p-2 sm:p-3 lg:p-4 border-t py-4 bg-white relative overflow-visible shrink-0">
        <div className="flex items-center justify-evenly sm:justify-center gap-2 sm:gap-3 w-full">
          {/* Mic Icon */}
          <button
            title={`${isAudioPublishing ? "Mute" : "Unmute"} mic`}
            onClick={toggleAudio}
            className={`${!isAudioPublishing ? "bg-red-600" : ""} p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center cursor-pointer transition-colors flex-shrink-0`}
          >
            {!isAudioPublishing ? (
              <MicOff size={18} className="sm:size-5 text-white " />
            ) : (
              <Mic size={18} className="sm:size-5 text-[#333]" />
            )}
          </button>

          {/* Video Icon */}
          <button
            title={`${isVideoPublishing ? "Turn off" : "Turn on"} video`}
            onClick={toggleVideo}
            aria-pressed={isVideoPublishing}
            className={`${!isVideoPublishing ? "bg-red-600" : ""} p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center cursor-pointer transition-colors flex-shrink-0`}
          >
            {!isVideoPublishing ? (
              <VideoOff size={18} className="sm:size-5 text-white" />
            ) : (
              <Video size={18} className="sm:size-5 text-[#333]" />
            )}
          </button>

          {/* Computer/Screen Share Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleScreenShare();
            }}
            title={`${isScreenSharing ? "Stop" : "Start"} screen share`}
            aria-pressed={isScreenSharing}
            className={`${!isScreenSharing ? "bg-red-600" : ""} p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center cursor-pointer transition-colors flex-shrink-0`}
          >
            {!isScreenSharing ? (
              <MonitorOff size={18} className="sm:size-5 text-white" />
            ) : (
              <ScreenShare size={18} className="sm:size-5 text-[#333]" />
            )}
          </button>

          {/* Smiley Emoji Icon */}
          <button
            title={`${showQuickEmojis ? "Hide" : "Add"} reactions`}
            className={`p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center cursor-pointer transition-colors flex-shrink-0
              ${
                showQuickEmojis
                  ? "bg-blue-100 border-blue-400"
                  : "text-[#344054] hover:bg-gray-100"
              }`}
            onClick={() => setShowQuickEmojis(!showQuickEmojis)}
          >
            <svg
              width="16"
              height="16"
              className="sm:w-[17px] sm:h-[17px]"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.125 0C6.51803 0 4.94714 0.476523 3.611 1.36931C2.27485 2.2621 1.23344 3.53105 0.618482 5.0157C0.00352044 6.50035 -0.157382 8.13401 0.156123 9.71011C0.469628 11.2862 1.24346 12.7339 2.37976 13.8702C3.51606 15.0065 4.9638 15.7804 6.53989 16.0939C8.11599 16.4074 9.74966 16.2465 11.2343 15.6315C12.719 15.0166 13.9879 13.9752 14.8807 12.639C15.7735 11.3029 16.25 9.73197 16.25 8.125C16.2477 5.97081 15.391 3.90551 13.8677 2.38227C12.3445 0.85903 10.2792 0.00227486 8.125 0ZM8.125 15C6.76526 15 5.43605 14.5968 4.30546 13.8414C3.17487 13.0859 2.29368 12.0122 1.77333 10.7559C1.25298 9.49971 1.11683 8.11737 1.3821 6.78375C1.64738 5.45013 2.30216 4.22513 3.26364 3.26364C4.22513 2.30215 5.45014 1.64737 6.78376 1.3821C8.11738 1.11683 9.49971 1.25298 10.756 1.77333C12.0122 2.29368 13.0859 3.17487 13.8414 4.30545C14.5968 5.43604 15 6.76525 15 8.125C14.9979 9.94773 14.2729 11.6952 12.9841 12.9841C11.6952 14.2729 9.94773 14.9979 8.125 15ZM4.375 6.5625C4.375 6.37708 4.42999 6.19582 4.533 6.04165C4.63601 5.88748 4.78243 5.76732 4.95374 5.69636C5.12504 5.62541 5.31354 5.60684 5.4954 5.64301C5.67726 5.67919 5.8443 5.76848 5.97542 5.89959C6.10653 6.0307 6.19582 6.19775 6.23199 6.3796C6.26816 6.56146 6.2496 6.74996 6.17864 6.92127C6.10768 7.09257 5.98752 7.23899 5.83335 7.342C5.67918 7.44502 5.49792 7.5 5.3125 7.5C5.06386 7.5 4.82541 7.40123 4.64959 7.22541C4.47378 7.0496 4.375 6.81114 4.375 6.5625ZM11.875 6.5625C11.875 6.74792 11.82 6.92918 11.717 7.08335C11.614 7.23752 11.4676 7.35768 11.2963 7.42864C11.125 7.49959 10.9365 7.51816 10.7546 7.48199C10.5727 7.44581 10.4057 7.35652 10.2746 7.22541C10.1435 7.0943 10.0542 6.92725 10.018 6.7454C9.98184 6.56354 10.0004 6.37504 10.0714 6.20373C10.1423 6.03243 10.2625 5.88601 10.4167 5.783C10.5708 5.67998 10.7521 5.625 10.9375 5.625C11.1861 5.625 11.4246 5.72377 11.6004 5.89959C11.7762 6.0754 11.875 6.31386 11.875 6.5625ZM11.7914 10.3125C10.9875 11.7023 9.65078 12.5 8.125 12.5C6.59922 12.5 5.26328 11.7031 4.45938 10.3125C4.41416 10.2414 4.38379 10.1618 4.37011 10.0786C4.35643 9.99546 4.35972 9.91038 4.37977 9.82851C4.39983 9.74664 4.43623 9.66967 4.48681 9.60223C4.53738 9.53479 4.60107 9.47828 4.67405 9.4361C4.74703 9.39391 4.82778 9.36693 4.91146 9.35676C4.99514 9.3466 5.08001 9.35347 5.16096 9.37695C5.24192 9.40044 5.31729 9.44006 5.38253 9.49342C5.44778 9.54679 5.50156 9.61281 5.54063 9.6875C6.12422 10.6961 7.04141 11.25 8.125 11.25C9.2086 11.25 10.1258 10.6953 10.7086 9.6875C10.7915 9.54391 10.928 9.43912 11.0881 9.3962C11.2483 9.35327 11.4189 9.37571 11.5625 9.45859C11.7061 9.54147 11.8109 9.678 11.8538 9.83814C11.8967 9.99828 11.8743 10.1689 11.7914 10.3125Z"
                fill={showQuickEmojis ? "#ffffff" : "#344054"}
              />
            </svg>
          </button>

          {/* Hand Raise Button with Animation */}
          <div className="relative flex-shrink-0">
            <button
              onClick={toggleHandRaise}
              title={`${isHandRaised ? "Lower" : "Raise"} hand`}
              className={`p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors ${
                isHandRaised ? "bg-blue-100 border-blue-400" : ""
              }`}
            >
              <Hand
                size={18}
                className={`sm:size-5 ${isHandRaised ? "text-white" : "text-gray-700"}`}
              />
            </button>
            <div className="absolute bottom-full right-0 mb-2 pointer-events-none">
              <RaiseHandAnimation
                trigger={isHandRaised}
                position="bottom-right"
                useRelativePosition={true}
              />
            </div>
          </div>

          {/* <div
            className={`p-1.5 sm:p-2 rounded-md w-8 h-8 sm:w-9 sm:h-9 border border-[#E4E7EC] flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0`}
          >
            <BuzzMenu />
          </div> */}

          {/* End Call Popover (only for host/caller) */}
          <button
            className="p-1.5 sm:p-2 rounded w-auto sm:w-[70px] px-3 sm:px-4 flex items-center justify-center bg-red-500 hover:bg-red-600 cursor-pointer transition-colors flex-shrink-0"
            onClick={handleMainCallEnd}
          >
            <Image
              src={"/PhoneSlash.svg"}
              alt={"phone icon"}
              width={18}
              height={18}
              className="sm:w-5 sm:h-5"
            />
          </button>
        </div>
      </div>
      <HuddleEmojiReactions
        name={localParticipant?.username}
        showQuickEmojis={showQuickEmojis}
      />

      {/* Buzz timeout */}
      <BuzzTimeout handleLeave={handleTimeoutLeave} />
      <GeneralTimeout handleLeave={handleTimeoutEnd} />
    </div>
  );
};
{/* prettier-ignore */ }
export default ChatBuzzSidePanel;

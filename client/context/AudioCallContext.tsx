"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

interface AudioCallContextType {
  isReceivingCall: boolean;
  isCallActive: boolean;
  callerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  startCall: (receiverId: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
}

const AudioCallContext = createContext<AudioCallContextType | null>(null);

export const AudioCallProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socket = useSocket();
  const { user } = useAuth();

  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const currentRoomIdRef = useRef<string>("");
  const isCallerRef = useRef<boolean>(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const callStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    const handleUserJoined = ({
      userId,
      caller,
    }: {
      userId: string;
      caller: string;
    }) => {
      // User B receives this when A calls
      setCallerId(userId);
      setCallerName(caller);
      setIsReceivingCall(true);
      currentRoomIdRef.current = [user._id, userId].sort().join("_");
      isCallerRef.current = false;
      socket.emit("join-audio-call-room", { roomId: currentRoomIdRef.current });
    };

    const handleReject = () => {
      cleanupCall();
    };

    const handleEnd = () => {
      cleanupCall();
    };

    const handleUserLeft = () => {
      cleanupCall();
    };

    const handleOffer = async ({ offer }: { offer: any }) => {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        // Process queued ice candidates
        pendingCandidatesRef.current.forEach(async (candidate) => {
          try {
            await peerConnectionRef.current?.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
          } catch (e) {
            console.error(e);
          }
        });
        pendingCandidatesRef.current = [];

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("audio-call-answer", {
          roomId: currentRoomIdRef.current,
          answer,
        });
      } catch (err) {
        console.error("Error handling offer", err);
      }
    };

    const handleAnswer = async ({ answer }: { answer: any }) => {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        callStartTimeRef.current = Date.now();
        // Process queued ice candidates
        pendingCandidatesRef.current.forEach(async (candidate) => {
          try {
            await peerConnectionRef.current?.addIceCandidate(
              new RTCIceCandidate(candidate),
            );
          } catch (e) {
            console.error(e);
          }
        });
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("Error handling answer", err);
      }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: any }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate", err);
        }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const handleAccepted = async () => {
      const pc = peerConnectionRef.current;
      if (!pc || !isCallerRef.current) return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("audio-call-offer", {
          roomId: currentRoomIdRef.current,
          offer,
        });
      } catch (err) {
        console.error("Error creating offer", err);
      }
    };

    socket.on("user-joined-audio-call", handleUserJoined);
    socket.on("audio-call-reject", handleReject);
    socket.on("audio-call-end", handleEnd);
    socket.on("user-left-audio-call", handleUserLeft);
    socket.on("audio-call-offer", handleOffer);
    socket.on("audio-call-answer", handleAnswer);
    socket.on("audio-call-ice-candidate", handleIceCandidate);
    socket.on("audio-call-accepted", handleAccepted);

    return () => {
      socket.off("user-joined-audio-call", handleUserJoined);
      socket.off("audio-call-reject", handleReject);
      socket.off("audio-call-end", handleEnd);
      socket.off("user-left-audio-call", handleUserLeft);
      socket.off("audio-call-offer", handleOffer);
      socket.off("audio-call-answer", handleAnswer);
      socket.off("audio-call-ice-candidate", handleIceCandidate);
      socket.off("audio-call-accepted", handleAccepted);
    };
  }, [socket, user]);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const setupMediaAndPeer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("audio-call-ice-candidate", {
            roomId: currentRoomIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      return pc;
    } catch (err) {
      console.error("Error accessing media devices.", err);
      return null;
    }
  };

  const startCall = async (receiverId: string) => {
    if (!socket || !user) return;

    currentRoomIdRef.current = [user._id, receiverId].sort().join("_");
    isCallerRef.current = true;

    socket.emit("join-audio-call", { receiverId, caller: user.name });
    setIsCallActive(true);

    await setupMediaAndPeer();
  };

  const acceptCall = async () => {
    setIsReceivingCall(false);
    setIsCallActive(true);
    callStartTimeRef.current = Date.now();
    await setupMediaAndPeer();
    socket.emit("audio-call-accepted", { roomId: currentRoomIdRef.current });
  };

  const rejectCall = () => {
    socket.emit("audio-call-reject", { roomId: currentRoomIdRef.current });
    cleanupCall();
  };

  const calculateDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const endCall = () => {
    let durationStr = undefined;
    if (callStartTimeRef.current) {
      durationStr = calculateDuration(Date.now() - callStartTimeRef.current);
    }
    socket.emit("audio-call-end", {
      roomId: currentRoomIdRef.current,
      duration: durationStr,
    });
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const cleanupCall = () => {
    setIsReceivingCall(false);
    setIsCallActive(false);
    setCallerName("");
    setCallerId("");
    setIsMuted(false);
    currentRoomIdRef.current = "";
    isCallerRef.current = false;
    callStartTimeRef.current = null;
    pendingCandidatesRef.current = [];

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setLocalStream(null);
    }
    setRemoteStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  return (
    <AudioCallContext.Provider
      value={{
        isReceivingCall,
        isCallActive,
        callerName,
        localStream,
        remoteStream,
        isMuted,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
      }}
    >
      {children}
    </AudioCallContext.Provider>
  );
};

export const useAudioCall = () => {
  const context = useContext(AudioCallContext);
  if (!context) {
    throw new Error("useAudioCall must be used within an AudioCallProvider");
  }
  return context;
};

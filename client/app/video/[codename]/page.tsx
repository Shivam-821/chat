"use client";

import { VideoFrame1, VideoFrame2 } from "@/components/VideoFrame";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { use, useState, useRef, useEffect } from "react";
import {
  PhoneOff,
  MoreVertical,
  LayoutPanelLeft,
  PictureInPicture2,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  MessageSquare,
  X,
  Send,
  CameraOff,
  Loader2,
} from "lucide-react";
import { createVideoCallApi, joinVideoCallApi } from "@/api/api";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ codename: string }>;
}

const VideoCallPage = ({ params }: PageProps) => {
  const codename = use(params).codename;
  const { token, user } = useAuth();
  const socket = useSocket();
  const [videoFramNo, setVideoFramNo] = useState<number>(1);

  // Disable global scrolling while on the video call page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [role, setRole] = useState<"host" | "guest" | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Local stream preview for Lobby
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (!isVideoOff && !hasJoined) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: !isMuted })
        .then((stream) => {
          currentStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    } else {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOff, isMuted, hasJoined]);

  const handleJoinCall = async () => {
    if (!token || !user) {
      toast.error("Please login to join the call.");
      return;
    }
    setIsJoining(true);

    try {
      // First try to join an existing call
      let res = await joinVideoCallApi(token, codename);

      if (res?.success) {
        // Successfully joined (or rejoined)
        const callData = res.data.videoCall;
        setRole(callData.host === user._id ? "host" : "guest");
        setHasJoined(true);
      } else if (res?.status === 404) {
        // If joining fails strictly because call doesn't exist yet, try creating it
        let createRes = await createVideoCallApi(token, codename);
        if (createRes?.success) {
          setRole("host");
          setHasJoined(true);
        }
      }
    } catch (err) {
      console.error("Failed to join call:", err);
    } finally {
      setIsJoining(false);
    }
  };

  const [positionX, setPositionX] = useState<number>(0);
  const isDragging = useRef<boolean>(false);
  const startClientX = useRef<number>(0);
  const startPosX = useRef<number>(0);

  // Simulated Remote State
  const [isRemoteMuted, setIsRemoteMuted] = useState(true);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);

  // WebRTC States & Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const roleRef = useRef(role);
  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  // WebRTC Connection Setup
  useEffect(() => {
    if (!hasJoined || !socket.connected) return;

    const setupWebRTC = async () => {
      // 1. Initialize Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // TURN servers — fallback relay for production behind symmetric NAT
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });
      peerConnectionRef.current = pc;

      // 2. Handle incoming Remote Stream
      pc.ontrack = (event) => {
        console.log(
          "📡 Remote track received!",
          event.track.kind,
          event.streams,
        );
        const incomingStream = event.streams[0];
        if (incomingStream) {
          // Use a new MediaStream wrapper to guarantee React detects the reference change
          const freshStream = new MediaStream(incomingStream.getTracks());
          setRemoteStream(freshStream);
        } else {
          setRemoteStream((prev) => {
            const s = prev ?? new MediaStream();
            s.addTrack(event.track);
            return new MediaStream(s.getTracks());
          });
        }
        setIsRemoteMuted(false);
        setIsRemoteVideoOff(false);
      };

      pc.onconnectionstatechange = () => {
        console.log("WebRTC Connection State:", pc.connectionState);
      };

      // 3. Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("video-ice-candidate", {
            roomId: codename,
            candidate: event.candidate,
          });
        }
      };

      // 4. Get Local Stream and add tracks
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          cameraTrackRef.current = videoTrack; // save original camera track
        }

        setLocalStream(stream); // Trigger VideoFrame re-render with the real stream

        // Apply initial mute/video off states
        stream.getAudioTracks().forEach((track) => (track.enabled = !isMuted));
        stream
          .getVideoTracks()
          .forEach((track) => (track.enabled = !isVideoOff));

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch (err) {
        console.error("Error accessing media devices.", err);
        toast.error("Please allow camera and microphone permissions.");
        return; // Abort if we can't get media
      }

      // 5. Register ALL socket listeners BEFORE emitting join
      socket.on("user-joined-video", async (data: { role: string }) => {
        if (roleRef.current === "host") {
          // Guest joined, Host creates the offer
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("video-offer", { roomId: codename, offer });
          } catch (err) {
            console.error("Error creating offer:", err);
          }
        }
      });

      socket.on("video-offer", async (data: { offer: any }) => {
        if (roleRef.current === "guest") {
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer),
            );

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Flush queued ICE candidates
            while (iceCandidateQueue.current.length > 0) {
              const candidate = iceCandidateQueue.current.shift();
              if (candidate)
                await pc
                  .addIceCandidate(new RTCIceCandidate(candidate))
                  .catch(console.error);
            }

            socket.emit("video-answer", { roomId: codename, answer });
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        }
      });

      socket.on("video-answer", async (data: { answer: any }) => {
        if (roleRef.current === "host") {
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
            console.log("✅ Host set remote description (answer)");

            // Flush queued ICE candidates
            while (iceCandidateQueue.current.length > 0) {
              const candidate = iceCandidateQueue.current.shift();
              if (candidate)
                await pc
                  .addIceCandidate(new RTCIceCandidate(candidate))
                  .catch(console.error);
            }
          } catch (err) {
            console.error("Error setting remote description from answer:", err);
          }
        }
      });

      socket.on("video-ice-candidate", async (data: { candidate: any }) => {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            iceCandidateQueue.current.push(data.candidate);
          }
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      });

      socket.on("toggle-video", (data: { isVideoOff: boolean }) => {
        setIsRemoteVideoOff(data.isVideoOff);
      });

      socket.on("toggle-mic", (data: { isMuted: boolean }) => {
        setIsRemoteMuted(data.isMuted);
      });

      socket.on("user-left-video-call", (data: { role: string }) => {
        if (data.role === "host") {
          toast.error("Host has ended the call.");
          setTimeout(() => {
            window.location.href = "/chat";
          }, 2000);
        } else {
          toast.error("Guest has left the call.");
          setRemoteStream(null);
          setIsRemoteVideoOff(true);
          setIsRemoteMuted(true);
        }
      });

      // 6. NOW emit join — all listeners are registered, so we won't miss events
      socket.emit("join-video-call", {
        roomId: codename,
        role: roleRef.current,
      });
    };

    setupWebRTC();

    return () => {
      socket.off("user-joined-video");
      socket.off("video-offer");
      socket.off("video-answer");
      socket.off("video-ice-candidate");
      socket.off("toggle-video");
      socket.off("toggle-mic");
      socket.off("user-left-video-call");

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasJoined, codename, socket]);

  // Handle local toggles specifically during the active call
  useEffect(() => {
    if (localStreamRef.current && hasJoined) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isMuted));
      localStreamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoOff));

      socket.emit("toggle-mic", { roomId: codename, isMuted });
      socket.emit("toggle-video", { roomId: codename, isVideoOff });
    }
  }, [isMuted, isVideoOff, hasJoined, codename, socket]);

  const handleEndCall = async () => {
    if (!token) return;

    // Disconnect our media and socket presence
    socket.emit("leave-video-call", { roomId: codename, role });

    if (role === "host") {
      // Actually terminating the call session in the DB
      try {
        const { endVideoCallApi } = await import("@/api/api");
        await endVideoCallApi(token, codename);
      } catch (err) {
        console.error("Failed to end call from api:", err);
      }
    }
    window.location.href = "/chat";
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startClientX.current = e.clientX;
    startPosX.current = positionX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const badgeRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current || !badgeRef.current)
      return;
    const deltaX = e.clientX - startClientX.current;

    let newX = startPosX.current + deltaX;

    const containerRect = containerRef.current.getBoundingClientRect();
    const badgeRect = badgeRef.current.getBoundingClientRect();

    // Since positionX defines the transform translateX offset from the 50% left position:
    // x = 0 means perfectly centered (left: 50%, translateX: -50%)
    const minX = -1 * (containerRect.width / 2) + badgeRect.width / 2;
    const maxX = containerRect.width / 2 - badgeRect.width / 2;

    if (newX < minX) newX = minX;
    if (newX > maxX) newX = maxX;

    setPositionX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pictureInPicture, setPictureInPicture] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0); // seconds

  // Start call timer when joined
  useEffect(() => {
    if (!hasJoined) return;
    const interval = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [hasJoined]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleToggleScreenShare = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (!isScreenSharing) {
      try {
        // 1. Get screen stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // 2. Find the video sender in the PeerConnection and replace its track
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);

        // 3. Update local preview stream (so your own UI shows screen)
        const newLocalStream = new MediaStream([
          screenTrack,
          ...(localStreamRef.current?.getAudioTracks() || []),
        ]);
        setLocalStream(newLocalStream);

        // 4. When user clicks "Stop sharing" from the browser's built-in bar
        screenTrack.onended = () => stopScreenShare();

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
        // user cancelled the picker — no state change needed
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    const pc = peerConnectionRef.current;
    const cameraTrack = cameraTrackRef.current;
    if (!pc || !cameraTrack) return;

    // Restore the camera track in the PeerConnection
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender) await sender.replaceTrack(cameraTrack);

    // Restore local preview
    const restoredStream = new MediaStream([
      cameraTrack,
      ...(localStreamRef.current?.getAudioTracks() || []),
    ]);
    setLocalStream(restoredStream);
    setIsScreenSharing(false);
  };

  // Toggle Fullscreen using standard Web API
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen to fullscreen changes to update UI state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!hasJoined) {
    return (
      <div className="h-[screen w-screen bg-white dark:bg-neutral-950 flex flex-col md:flex-row items-center justify-center p-8 gap-8">
        {/* Local Preview */}
        <div className="w-full max-w-2xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative shadow-lg ring-1 ring-neutral-200 dark:ring-neutral-800">
          {isVideoOff ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4">
              <CameraOff size={48} className="text-neutral-500" />
              <p className="text-neutral-500 font-medium">Camera is off</p>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover transform scale-x-[-1]"
            />
          )}

          {/* Quick Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
            >
              {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Join Panel */}
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
              Ready to join?
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Room:{" "}
              <span className="font-mono font-medium text-lime-600 dark:text-lime-400">
                {codename}
              </span>
            </p>
          </div>

          <button
            onClick={handleJoinCall}
            disabled={isJoining}
            className="w-full py-3 px-6 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-500/50 text-white rounded-full font-medium text-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Joining...
              </>
            ) : (
              "Join Now"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-64px)] w-screen relative bg-[#f5ffdf] dark:bg-neutral-950 overflow-hidden flex flex-col"
    >
      <div
        ref={badgeRef}
        className="absolute z-20 top-0 left-1/2 bg-lime-600 text-white w-[25%] min-w-[150px] h-[4%] rounded-b-lg px-4 flex items-center cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ transform: `translateX(calc(-50% + ${positionX}px))` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <p className="text-center font-semibold truncate flex-1 text-sm">
          {codename}
        </p>
        <span className="text-xs font-mono bg-lime-700/60 px-2 py-0.5 rounded-full shrink-0">
          {formatDuration(callDuration)}
        </span>
      </div>

      {/* Video Frames */}
      <div className="flex-1 w-full h-full relative flex flex-col min-h-0">
        {videoFramNo === 1 ? (
          <VideoFrame1
            isCameraOn={!isVideoOff}
            isMicOn={!isMuted}
            isRemoteCameraOn={!isRemoteVideoOff}
            isRemoteMicOn={!isRemoteMuted}
            localStream={localStream}
            remoteStream={remoteStream}
          />
        ) : (
          <VideoFrame2
            isCameraOn={!isVideoOff}
            isMicOn={!isMuted}
            isRemoteCameraOn={!isRemoteVideoOff}
            isRemoteMicOn={!isRemoteMuted}
            localStream={localStream}
            remoteStream={remoteStream}
          />
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full h-18 bg-lime-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 shadow-lg z-30 relative">
        {/* Left Controls (Chat) */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Toggle Chat"
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-md relative ${isChatOpen ? "bg-lime-500 hover:bg-lime-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
          >
            <MessageSquare size={20} />
            {/* Unread dot simulation */}
            {!isChatOpen && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 border-2 border-white dark:border-neutral-900 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Center Controls (e.g. End Call, Mute, Video, Screen Share) */}
        <div className="flex-1 flex justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute"}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-md ${isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            title={isVideoOff ? "start video" : "stop video"}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-md ${isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>

          <button
            onClick={handleToggleScreenShare}
            title={
              isScreenSharing
                ? "Stop Screen Presentation"
                : "Start screen presentation"
            }
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-md ${isScreenSharing ? "bg-lime-500 hover:bg-lime-600 text-white" : "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200"}`}
          >
            <MonitorUp size={20} />
          </button>

          <button
            title="End call"
            onClick={handleEndCall}
            className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md ml-2"
          >
            <PhoneOff size={20} />
          </button>
        </div>
        {/* Right Controls */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {/* Settings / Frame Switch Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="change layout"
              className="h-10 w-10 rounded-full hover:bg-lime-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute bottom-12 right-0 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                <p className="px-4 py-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Layout
                </p>
                <button
                  onClick={() => {
                    setVideoFramNo(videoFramNo === 1 ? 2 : 1);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 ${videoFramNo === 1 ? "text-lime-600 font-medium" : "text-blue-500 dark:text-neutral-200"}`}
                >
                  <LayoutPanelLeft size={16} />
                  Video Frame {videoFramNo}
                </button>
                <button
                  onClick={() => {
                    setPictureInPicture(!pictureInPicture);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 ${pictureInPicture ? "text-lime-600 font-medium" : "text-neutral-700 dark:text-neutral-200"}`}
                >
                  <PictureInPicture2 size={16} />
                  Picture in Picture
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullScreen}
            title="toggle screen size"
            className="h-10 w-10 rounded-full hover:bg-lime-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors"
          >
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>

      {/* Chat Modal Layer */}
      {isChatOpen && (
        <div
          className="absolute left-6 bottom-24 w-80 max-w-[calc(100vw-3rem)] bg-white dark:bg-black rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col z-40 animate-in slide-in-from-bottom-8 fade-in duration-200"
          style={{ height: "400px", maxHeight: "60vh" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare size={16} />
              In-call Messages
            </h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 my-2">
              Messages will be deleted when the call ends.
            </div>
            {/* Simulation of a received message */}
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] font-medium text-neutral-500 px-1">
                User 2 • 11:30 AM
              </span>
              <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-3 py-2 rounded-2xl rounded-tl-sm text-sm max-w-[85%] shadow-sm">
                Hey, can you see my screen now?
              </div>
            </div>
            {/* Simulation of a sent message */}
            <div className="flex flex-col gap-1 items-end mt-2">
              <span className="text-[10px] font-medium text-neutral-500 px-1">
                You • 11:31 AM
              </span>
              <div className="bg-lime-500 text-white px-3 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%] shadow-sm">
                Yes, looks good!
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Send a message..."
                className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 dark:text-neutral-200 w-full"
              />
              <button className="h-9 w-9 bg-lime-500 hover:bg-lime-600 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm">
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;

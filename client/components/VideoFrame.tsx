import { CameraOff, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const VideoFrame1 = ({
  isCameraOn,
  isMicOn,
  isRemoteCameraOn = false,
  isRemoteMicOn = false,
  localStream = null,
  remoteStream = null,
}: {
  isCameraOn: boolean;
  isMicOn: boolean;
  isRemoteCameraOn?: boolean;
  isRemoteMicOn?: boolean;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach Local Stream
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraOn]);

  // Attach Remote Stream
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((e) => {
          if (e.name !== "AbortError") console.error(e);
        });
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row">
      <div className="h-1/2 w-full md:h-full md:w-1/2 relative bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col justify-center items-center gap-2">
            <h1 className="text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              You
            </h1>
            <CameraOff
              className="text-neutral-400 dark:text-neutral-500"
              size={32}
            />
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-1.5 left-1 flex gap-2 z-30">
          {!isMicOn ? (
            <div className="text-red-500 p-2 rounded-full">
              <MicOff size={18} />
            </div>
          ) : (
            <div className="text-green-500 p-2 rounded-full animate-pulse">
              <Mic size={18} />
            </div>
          )}
        </div>
      </div>
      <div className="h-1/2 w-full md:h-full md:w-1/2 relative bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
        {isRemoteCameraOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col justify-center items-center gap-2">
            <h1 className="text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
              User 2
            </h1>
            <CameraOff
              className="text-neutral-400 dark:text-neutral-500"
              size={32}
            />
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-1.5 left-1 md:left-auto md:right-1 flex gap-2 z-30">
          {!isRemoteMicOn ? (
            <div className="text-red-500 p-2 rounded-full">
              <MicOff size={18} />
            </div>
          ) : (
            <div className="text-green-500 p-2 rounded-full animate-pulse">
              <Mic size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const VideoFrame2 = ({
  isCameraOn,
  isMicOn,
  isRemoteCameraOn = false,
  isRemoteMicOn = false,
  localStream = null,
  remoteStream = null,
}: {
  isCameraOn: boolean;
  isMicOn: boolean;
  isRemoteCameraOn?: boolean;
  isRemoteMicOn?: boolean;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach Local Stream — also depends on isCameraOn so it re-runs when the video element mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraOn]);

  // Attach Remote Stream
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((e) => {
          if (e.name !== "AbortError") console.error(e);
        });
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current || !draggableRef.current)
      return;

    let newX = e.clientX - startPos.current.x;
    let newY = e.clientY - startPos.current.y;

    const containerRect = containerRef.current.getBoundingClientRect();
    const draggableRect = draggableRef.current.getBoundingClientRect();

    // Bounds checking
    const maxX = containerRect.width - draggableRect.width;
    const maxY = containerRect.height - draggableRect.height;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX > maxX) newX = maxX;
    if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Set initial position to top-right
  useEffect(() => {
    if (containerRef.current && draggableRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const draggableRect = draggableRef.current.getBoundingClientRect();
      setPosition({
        x: containerRect.width - draggableRect.width - 16, // 16px right margin
        y: 16, // 16px top margin
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full border relative overflow-hidden bg-[#f5fedf] dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
    >
      <div className="h-full w-full relative flex items-center justify-center">
        {isRemoteCameraOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col justify-center items-center gap-2">
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Remote Feed
            </p>
            <CameraOff
              className="text-neutral-400 dark:text-neutral-500"
              size={32}
            />
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-1.5 left-1 flex gap-2 z-10">
          {!isRemoteMicOn ? (
            <div className="text-red-500 p-2 rounded-full">
              <MicOff size={18} />
            </div>
          ) : (
            <div className="text-green-500 p-2 rounded-full animate-pulse">
              <Mic size={18} />
            </div>
          )}
        </div>
      </div>
      <div
        ref={draggableRef}
        className="h-[24%] min-h-[120px] w-[18%] min-w-[160px] border absolute z-20 bg-[#c4e277] dark:bg-neutral-600 border-neutral-200 dark:border-neutral-700 rounded-lg cursor-grab active:cursor-grabbing touch-none shadow-lg flex items-center justify-center overflow-hidden"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          top: 0,
          left: 0,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover pointer-events-none"
          />
        ) : (
          <div className="flex flex-col justify-center items-center gap-1">
            <CameraOff
              className="text-neutral-500 dark:text-neutral-200"
              size={24}
            />
            <p className="text-neutral-500 dark:text-neutral-200 text-xs font-medium">
              You
            </p>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute top-1 right-0 flex gap-2 z-30">
          {!isMicOn ? (
            <div className="text-red-500 p-2 rounded-full">
              <MicOff size={18} />
            </div>
          ) : (
            <div className="text-green-500 p-2 rounded-full animate-pulse">
              <Mic size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

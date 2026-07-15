import React, { useRef, useState, useEffect } from "react";
import { formatTime } from "../services/db";

export const VideoPlayer = ({
  video,
  initialTime = 0,
  seekToTime = null,
  bookmarks = [],
  onProgress = () => {},
}) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Handle outside seek triggers (when clicking a bookmark from the sidebar)
  useEffect(() => {
    if (seekToTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      setCurrentTime(seekToTime);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      triggerToast(`Jumped to bookmark: ${formatTime(seekToTime)}`);
    }
  }, [seekToTime]);

  // Handle initial watch progress restore ("Continue Watching")
  useEffect(() => {
    if (initialTime > 0 && videoRef.current) {
      const handleLoadedMetadata = () => {
        // Seek to the initial time once metadata is loaded
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
        triggerToast(`Resumed playback from ${formatTime(initialTime)}`);
      };

      if (videoRef.current.readyState >= 1) {
        // Metadata already loaded
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
        triggerToast(`Resumed playback from ${formatTime(initialTime)}`);
      } else {
        videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      }

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        }
      };
    }
  }, [video.id, initialTime]);

  // Handle video source changes explicitly to force browser player to load new feed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [video.id]);

  // Sync state with HTML5 video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curTime = videoRef.current.currentTime;
      setCurrentTime(curTime);
      onProgress(curTime, duration);
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.duration);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.error("Autoplay/play failed:", err);
        });
      }
    }
  };

  // Seek video via custom progress bar click
  const handleProgressClick = (e) => {
    if (progressRef.current && videoRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume control handlers
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      videoRef.current.muted = newMute;
      if (!newMute && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  // Screen Fullscreen toggle
  const toggleFullscreen = () => {
    const playerEl = videoRef.current?.parentElement;
    if (!playerEl) return;

    if (!document.fullscreenElement) {
      playerEl.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Calculate percentages for render bookmark markers
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-player-wrapper animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div 
        className="video-player-container"
        style={{
          position: "relative",
          backgroundColor: "#000",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid var(--border-color)",
          aspectRatio: "16/9"
        }}
      >
        {/* Blocker Overlay: Prevent mouse drag, double click, inspect, or simple save options */}
        <div 
          className="video-player-overlay-blocker"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "calc(100% - 48px)", // Covers the video panel, leaving bottom controls accessible
            zIndex: 10,
            cursor: "pointer",
            background: "transparent",
            userSelect: "none"
          }}
          onClick={togglePlay}
        />

        {/* HTML5 video element */}
        <video
          ref={videoRef}
          src={video.url}
          className="html5-video-player"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleLoadedData}
          onLoadedMetadata={handleLoadedData}
          controls={false} // Disable default controls to prevent inspection downloads
          disablePictureInPicture // Disables PIP (which bypasses screenshot blockers)
          playsInline
          preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain"
          }}
        />

        {/* Overlay Notification Toast */}
        {showToast && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(12, 74, 110, 0.85)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              fontWeight: 500,
              zIndex: 100,
              pointerEvents: "none",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {toastMessage}
          </div>
        )}

        {/* Custom Player Controls */}
        <div
          className="custom-player-controls"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "48px",
            backgroundColor: "rgba(12, 74, 110, 0.95)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "4px 16px",
            zIndex: 20,
            color: "white"
          }}
        >
          {/* Progress Timeline & Markers */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            style={{
              height: "6px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px",
              position: "relative",
              cursor: "pointer",
              marginTop: "4px",
              display: "flex",
              alignItems: "center"
            }}
          >
            {/* Play progress filling */}
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "var(--bg-primary, #bae6fd)",
                borderRadius: "3px",
                position: "absolute",
                left: 0
              }}
            />

            {/* Bookmark Cue Dots */}
            {duration > 0 && bookmarks.map((bmark) => {
              const bPercent = (bmark.timestamp / duration) * 100;
              if (bPercent > 100) return null;
              
              return (
                <div
                  key={bmark.id}
                  title={`${bmark.name} (${formatTime(bmark.timestamp)})`}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering standard progress click
                    videoRef.current.currentTime = bmark.timestamp;
                  }}
                  style={{
                    position: "absolute",
                    left: `${bPercent}%`,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444", // Red dot for bookmark markers
                    border: "2px solid #ffffff",
                    transform: "translateX(-50%)",
                    zIndex: 25,
                    cursor: "pointer"
                  }}
                />
              );
            })}
          </div>

          {/* Action buttons row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexGrow: 1 }}>
            
            {/* Left buttons group */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlay}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {isPlaying ? (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                )}
              </button>

              {/* Time display indicator */}
              <div style={{ fontSize: "0.8rem", color: "#e0f2fe", fontFamily: "monospace" }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right buttons group */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Volume Slider & Speaker Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={toggleMute}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {isMuted || volume === 0 ? (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.03c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: "60px",
                    accentColor: "var(--bg-primary)",
                    cursor: "pointer",
                    height: "4px"
                  }}
                />
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {isFullscreen ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path>
                  </svg>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
      
      {/* Keyboard guide for ease of use */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", padding: "0 4px" }}>
        <span>💡 Clicking timeline registers bookmark seeking.</span>
        <span>🎬 Custom HTML5 Secure Player</span>
      </div>
    </div>
  );
};

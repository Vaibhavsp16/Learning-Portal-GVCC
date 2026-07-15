import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getVideoById, 
  getBookmarks, 
  addBookmark, 
  updateBookmark, 
  deleteBookmark, 
  getWatchProgress, 
  saveWatchProgress, 
  formatTime 
} from "../services/db";
import { SecurityOverlay } from "../components/SecurityOverlay";
import { VideoPlayer } from "../components/VideoPlayer";
import { BookmarkManager } from "../components/BookmarkManager";

export const VideoDetail = ({ videoId }) => {
  const { user } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState(null);
  const [initialTime, setInitialTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Ref to track latest time/duration for unmount progress save
  const progressRef = useRef({ time: 0, duration: 0 });
  const lastSavedTimeRef = useRef(0);

  // 1. Fetch Video details, Bookmarks, and Watch progress on load
  useEffect(() => {
    if (videoId && user) {
      setLoading(true);
      const vid = getVideoById(videoId);
      setVideo(vid);

      if (vid) {
        // Fetch bookmarks
        const savedBookmarks = getBookmarks(videoId, user.username);
        setBookmarks(savedBookmarks);

        // Fetch watch progress (Continue Watching)
        const progressRecord = getWatchProgress(videoId, user.username);
        if (progressRecord && progressRecord.progress < 98) {
          // If student has watched some portion, resume from last stop
          setInitialTime(progressRecord.timestamp);
          progressRef.current.time = progressRecord.timestamp;
          lastSavedTimeRef.current = progressRecord.timestamp;
        } else {
          setInitialTime(0);
          progressRef.current.time = 0;
          lastSavedTimeRef.current = 0;
        }
      }
      setLoading(false);
    }
  }, [videoId, user]);

  // 2. Autosave Watch Progress
  const handleProgress = (time, duration) => {
    setCurrentTime(time);
    progressRef.current = { time, duration };

    // Autosave progress every 3 seconds to avoid unnecessary LocalStorage thrashing
    if (Math.abs(time - lastSavedTimeRef.current) >= 3 && duration > 0) {
      saveWatchProgress(videoId, user.username, time, duration);
      lastSavedTimeRef.current = time;
    }
  };

  // 3. Save progress on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { time, duration } = progressRef.current;
      if (time > 0 && duration > 0) {
        saveWatchProgress(videoId, user.username, time, duration);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Execute unmount save
      handleBeforeUnload();
    };
  }, [videoId, user]);

  // 4. Bookmark Handlers
  const handleAddBookmark = (bookmarkData) => {
    const newBookmark = addBookmark({
      videoId,
      username: user.username,
      timestamp: bookmarkData.timestamp,
      name: bookmarkData.name,
      notes: bookmarkData.notes
    });
    setBookmarks(prev => [...prev, newBookmark].sort((a, b) => a.timestamp - b.timestamp));
  };

  const handleEditBookmark = (id, updatedData) => {
    const updated = updateBookmark(id, updatedData);
    if (updated) {
      setBookmarks(prev => prev.map(b => b.id === id ? updated : b));
    }
  };

  const handleDeleteBookmark = (id) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      deleteBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSelectBookmark = (timestamp) => {
    // Setting timestamp seeks the player
    setSeekToTime(timestamp);
    // Reset after a brief tick to allow click toggles on same timestamp
    setTimeout(() => setSeekToTime(null), 100);
  };

  const openEditModal = (bookmark) => {
    setEditTarget(bookmark);
    setEditName(bookmark.name);
    setEditNotes(bookmark.notes || "");
  };

  const handleUpdateBookmark = () => {
    if (editTarget) {
      handleEditBookmark(editTarget.id, {
        name: editName.trim() || editTarget.name,
        notes: editNotes.trim()
      });
      setEditTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <h3>Loading secured lecture assets...</h3>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <h3>Lecture not found</h3>
        <button className="btn btn-primary" onClick={() => window.location.hash = ""}>
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <SecurityOverlay isVideoActive={true}>
      <div className="container">
        
        {/* Back Link Row */}
        <div style={{ margin: "24px 0 12px 0" }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => window.location.hash = ""}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Catalog
          </button>
        </div>

        {/* Video detail layout */}
        <div className="video-detail-grid">
          
          {/* Main video player column */}
          <div>
            <VideoPlayer
              video={video}
              initialTime={initialTime}
              seekToTime={seekToTime}
              bookmarks={bookmarks}
              onProgress={handleProgress}
            />

            <div className="video-info-block animate-fade-in">
              <h1 className="video-info-title">{video.title}</h1>
              <div className="video-info-meta">
                <span className="student-badge" style={{ padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem" }}>
                  💡 {video.category}
                </span>
                <span>👨‍🏫 Instructor: <strong>{video.instructor}</strong></span>
                <span>📈 Level: <strong>{video.difficulty}</strong></span>
                <span>⏱️ Total Length: <strong>{formatTime(video.duration)}</strong></span>
              </div>
              <p className="video-info-desc">{video.description}</p>
            </div>
          </div>

          {/* Bookmarking manager sidebar column */}
          <div>
            <BookmarkManager
              currentTime={currentTime}
              bookmarks={bookmarks}
              onAddBookmark={handleAddBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onOpenEditBookmark={openEditModal}
              onSelectBookmark={handleSelectBookmark}
            />
          </div>

        </div>

      </div>

      {/* Edit Bookmark Modal dialog (Rendered at root to escape container relative transforms) */}
      {editTarget && (
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in">
            <div className="modal-header" style={{ fontWeight: 600, color: "var(--primary-dark)", fontSize: "1.2rem", marginBottom: "16px" }}>
              Edit Bookmark Detail
            </div>
            
            <div className="form-group">
              <label>Bookmark Title</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: "12px" }}>
              <label>Learning Notes</label>
              <textarea
                className="form-control"
                rows="4"
                style={{ resize: "none" }}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleUpdateBookmark}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </SecurityOverlay>
  );
};

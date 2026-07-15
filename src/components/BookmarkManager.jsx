import React, { useState } from "react";
import { formatTime } from "../services/db";

export const BookmarkManager = ({
  currentTime,
  bookmarks = [],
  onAddBookmark = () => {},
  onDeleteBookmark = () => {},
  onOpenEditBookmark = () => {},
  onSelectBookmark = () => {},
}) => {
  const [bName, setBName] = useState("");
  const [bNotes, setBNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddBookmark({
      name: bName.trim() || `Bookmark @ ${formatTime(currentTime)}`,
      notes: bNotes.trim(),
      timestamp: currentTime
    });
    setBName("");
    setBNotes("");
  };

  return (
    <div className="bookmarks-manager-panel animate-fade-in">
      <div className="bookmarks-panel-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Lesson Bookmarks</span>
        </h2>
      </div>

      {/* Bookmark creation form */}
      <form onSubmit={handleSubmit} className="bookmarks-add-form">
        <div className="bookmarks-add-form-row">
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
            Create Bookmark at:
          </span>
          <span className="bookmark-timestamp-badge">{formatTime(currentTime)}</span>
        </div>
        
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Title (e.g. Flexbox layout recap)"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <textarea
            className="form-control"
            rows="2"
            placeholder="Add learning notes or key concepts..."
            style={{ resize: "none", fontSize: "0.85rem" }}
            value={bNotes}
            onChange={(e) => setBNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Bookmark
        </button>
      </form>

      {/* Scrollable list of bookmarks */}
      <h3 style={{ fontSize: "0.9rem", color: "var(--primary-dark)", margin: "0 0 12px 0", fontWeight: 600 }}>
        Saved Timestamps ({bookmarks.length})
      </h3>

      <div className="bookmarks-scroll-list">
        {bookmarks.length === 0 ? (
          <div className="bookmarks-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--primary)" }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>No bookmarks set yet.</p>
            <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>
              Play the video and use the form above to pin key concepts.
            </p>
          </div>
        ) : (
          bookmarks.map((bmark) => (
            <div 
              key={bmark.id} 
              className="bookmark-item"
              onClick={() => onSelectBookmark(bmark.timestamp)}
            >
              <div className="bookmark-info-click">
                <div className="bookmark-item-title-row">
                  <span className="bookmark-item-time">{formatTime(bmark.timestamp)}</span>
                  <span className="bookmark-item-title">{bmark.name}</span>
                </div>
                {bmark.notes && (
                  <p className="bookmark-item-notes">{bmark.notes}</p>
                )}
              </div>

              {/* Edit/Delete Actions */}
              <div className="bookmark-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="bookmark-action-btn"
                  onClick={() => onOpenEditBookmark(bmark)}
                  title="Edit Bookmark Notes"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  className="bookmark-action-btn delete-btn"
                  onClick={() => onDeleteBookmark(bmark.id)}
                  title="Remove Bookmark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

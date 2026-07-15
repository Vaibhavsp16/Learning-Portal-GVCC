import React from "react";
import { formatTime } from "../services/db";

export const VideoCard = ({ video, progressRecord }) => {
  
  const handleCardClick = () => {
    window.location.hash = `#video/${video.id}`;
  };

  return (
    <div className="course-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      {/* Thumbnail with custom Category and Difficulty Badges */}
      <div className="course-thumbnail-mock">
        <span className="course-badge-category">{video.category}</span>
        <span className="course-badge-difficulty">{video.difficulty}</span>
        
        {/* Play Icon Placeholder */}
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
      </div>

      <div className="course-body">
        <h3 className="course-title">{video.title}</h3>
        <p className="course-desc">{video.description}</p>
        
        <div className="course-meta">
          <span>👨‍🏫 {video.instructor}</span>
          <span>⏱️ {formatTime(video.duration)}</span>
        </div>

        {/* Dynamic Watch Progress Bar */}
        {progressRecord && progressRecord.progress > 0 && (
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 500, color: "var(--primary)" }}>
              <span>Progress: {progressRecord.progress}%</span>
              <span>{formatTime(progressRecord.timestamp)} watched</span>
            </div>
            <div className="course-progress-bar-container">
              <div 
                className="course-progress-bar-fill"
                style={{ width: `${progressRecord.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

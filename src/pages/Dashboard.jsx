import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getVideos, getRecentlyWatched, getWatchProgress } from "../services/db";
import { VideoCard } from "../components/VideoCard";

export const Dashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (user) {
      // Fetch all core catalog videos
      const allVideos = getVideos();
      setVideos(allVideos);

      // Fetch student watch history
      const recent = getRecentlyWatched(user.username);
      setRecentVideos(recent);

      // Fetch progress mappings for progress indicators
      const progressRecordMap = {};
      allVideos.forEach(v => {
        const prog = getWatchProgress(v.id, user.username);
        if (prog) {
          progressRecordMap[v.id] = prog;
        }
      });
      setProgressMap(progressRecordMap);
    }
  }, [user]);

  return (
    <div className="container">
      <div className="dashboard-grid">
        
        {/* Left Side: Course Catalog List */}
        <div>
          <div className="dashboard-section-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
            </svg>
            <span>Course Lectures Catalog</span>
          </div>
          
          <div className="courses-grid">
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                progressRecord={progressMap[video.id]}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Recently Watched & Resume Playing Sidebar */}
        <div>
          <div className="recently-watched-sidebar animate-fade-in">
            <h3 style={{ fontSize: "1.1rem", color: "var(--primary-dark)", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Recently Watched</span>
            </h3>

            {recentVideos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                <p>No recent activity.</p>
                <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>Start watching a lecture to track your study progress.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {recentVideos.map((recent) => (
                  <a
                    key={recent.videoId}
                    href={`#video/${recent.videoId}`}
                    className="recent-item"
                    title={`Resume ${recent.videoDetails.title}`}
                  >
                    <div className="recent-thumb-small">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                    
                    <div className="recent-info">
                      <div className="recent-title">{recent.videoDetails.title}</div>
                      <div className="recent-meta-progress">
                        <span>Progress: {recent.progress}%</span>
                        <span style={{ color: "var(--primary)", fontWeight: 500 }}>Resume playback ➔</span>
                      </div>
                      
                      {/* Little slide fill bar */}
                      <div style={{ background: "var(--bg-primary)", height: "3px", borderRadius: "1.5px", marginTop: "6px", overflow: "hidden" }}>
                        <div style={{ background: "var(--primary)", width: `${recent.progress}%`, height: "100%" }} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

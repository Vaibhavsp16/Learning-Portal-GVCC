import React, { useState, useEffect } from "react";

export const SecurityOverlay = ({ children, isVideoActive = false }) => {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    // 1. Monitor Window Focus / Blur (Anti-Snipping Protection)
    const handleBlur = () => {
      setIsWindowBlurred(true);
      logSecurityEvent("Window focus lost - screen blurred.");
    };

    const handleFocus = () => {
      // Clear focus blur if they focus back
      setIsWindowBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsWindowBlurred(true);
        logSecurityEvent("Tab hidden - screen paused and blurred.");
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. Prevent Common Screenshot & Developer Inspection Keys
    const handleKeyDown = (e) => {
      // Catch screenshot modifiers immediately (pre-emptive blur)
      // When Win+Shift, Win+Alt, Ctrl+Shift, or Cmd+Shift are pressed, the page is blurred
      // before the user clicks the final 'S' or 'R' key to trigger the OS-level capture tool.
      const isModifierCombo =
        (e.metaKey && e.shiftKey) || // Win + Shift (Windows Snipping Tool) or Cmd + Shift (Mac)
        (e.metaKey && e.altKey) ||   // Win + Alt (Xbox Game Bar Screen Recording) or Cmd + Alt (Mac)
        (e.ctrlKey && e.shiftKey);   // Ctrl + Shift (Edge / Firefox screenshots)

      if (isModifierCombo) {
        setIsWindowBlurred(true);
        logSecurityEvent("Pre-emptively blurred content due to screenshot/recording modifiers.");
      }

      // Key combinations to check
      const isDevTools =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i")); // Mac Chrome inspect

      // Screenshot and Screen Recording Shortcuts
      const isScreenshotOrRecording =
        e.key === "PrintScreen" ||
        e.key === "PrtScn" ||
        e.key === "PrtSc";

      const isSaveOrPrint =
        (e.ctrlKey && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) ||
        (e.metaKey && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P"));

      const isSourceView =
        (e.ctrlKey && (e.key === "u" || e.key === "U")) ||
        (e.metaKey && (e.key === "u" || e.key === "U"));

      if (isDevTools) {
        e.preventDefault();
        e.stopPropagation();
        setIsWindowBlurred(true);
        logSecurityEvent("Blocked Developer Tools shortcut.");
      }

      if (isScreenshotOrRecording) {
        e.preventDefault();
        e.stopPropagation();
        setIsWindowBlurred(true); // Blurs synchronously before browser captures frame
        logSecurityEvent("Blocked Screen Capture/Recording shortcut.");
      }

      if (isSaveOrPrint) {
        e.preventDefault();
        e.stopPropagation();
        setIsWindowBlurred(true);
        logSecurityEvent("Blocked Save/Print shortcut.");
      }

      if (isSourceView) {
        e.preventDefault();
        e.stopPropagation();
        setIsWindowBlurred(true);
        logSecurityEvent("Blocked View Source shortcut.");
      }
    };

    // Un-blur when screenshot modifiers are released
    const handleKeyUp = (e) => {
      const isStillHoldingCombo =
        (e.metaKey && e.shiftKey) ||
        (e.metaKey && e.altKey) ||
        (e.ctrlKey && e.shiftKey);

      if (!isStillHoldingCombo) {
        // Only un-blur if window still has focus
        if (document.hasFocus()) {
          setIsWindowBlurred(false);
        }
      }
    };

    // 3. Block Right-Click Context Menu globally
    const handleContextMenu = (e) => {
      e.preventDefault();
      logSecurityEvent("Blocked mouse right-click context menu.");
    };

    window.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const logSecurityEvent = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setSecurityLogs((prev) => [{ time: timestamp, message: msg }, ...prev.slice(0, 10)]);
    console.warn(`[SECURITY WARN] ${msg}`);
  };

  const handleResume = () => {
    setIsWindowBlurred(false);
  };

  return (
    <div style={{ position: "relative", minHeight: "100%", width: "100%" }}>
      {/* Main Content Area */}
      <div 
        className={isWindowBlurred ? "security-blur-active" : ""}
        style={{
          filter: isWindowBlurred ? "blur(80px)" : "none",
          transition: "filter 0.15s ease-in-out"
        }}
      >
        {children}
      </div>

      {/* Security Intercept Screen Blocker (Opaque light-blue blur cover with no text warnings) */}
      {isWindowBlurred && (
        <div 
          className="security-screen-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(240, 247, 255, 0.99)", // Solid minimalistic light blue cover
            backdropFilter: "blur(80px)",
            zIndex: 9999,
            cursor: "pointer"
          }}
          onClick={handleResume}
        />
      )}
    </div>
  );
};

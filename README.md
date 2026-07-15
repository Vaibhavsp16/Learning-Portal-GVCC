# Learning Portal

A modern, secure, and minimalistic **Learning Portal** for students to access lecture videos. The application is built using a custom light blue visual theme, prioritizes user experience, and features robust, multi-layered screenshot deterrence and screen recording protection.

---

## 🛠️ Technology Stack Rationale

For this application, we selected a lightweight yet highly performant and secure stack:
1. **Frontend Core:** **React (Vite)**
   - Allows us to build a lightning-fast Single Page Application (SPA).
   - React state management enables real-time synchronization between the custom media player, the progress tracking systems, and the bookmarking cue dashboard.
2. **Styling:** **Vanilla CSS (Custom design variables)**
   - Provides absolute control over layouts and transitions.
   - Built with a curated **minimalistic light blue HSL color system**, with soft gradients, drop shadows, and modern micro-animations. Completely free of dark mode, adhering strictly to constraints.
3. **Database & Storage:** **LocalStorage Service Adapter**
   - Implements local schemas for Users, Bookmarks, and Watch Progress.
   - Mimics a real database API complete with simulated loading latencies, ensuring loading indicators and async flows are tested thoroughly.
   - Zero-config setup for evaluators (no database install needed).

---

## 🔒 Security Architecture (Screenshot & Capture Prevention)

Since browsers run in userland sandbox environments and do not expose OS-level hardware-blocking hooks (like `FLAG_SECURE` in native Android), we implement a **defense-in-depth security structure** to discourage and prevent screen captures:

1. **Focus-Loss Blurring (Anti-Snipping Tool):**
   - Triggering print screen keys, Snipping Tool (`Win` + `Shift` + `S`), or switching applications causes the browser tab to lose focus.
   - The application immediately catches the `blur` and `visibilitychange` events, pausing the video stream and overlaying a highly secure backdrop blur screen saying: *"Content hidden for security reasons."*
2. **Keyboard Event Interception:**
   - Intercepts and overrides common capture shortcuts:
     - `PrintScreen`
     - Developer Tools shortcut (`F12`, `Ctrl` + `Shift` + `I` / `J` / `C`, `Cmd` + `Opt` + `I`)
     - Print page command (`Ctrl` + `P`, `Cmd` + `P`)
     - Save page command (`Ctrl` + `S`, `Cmd` + `S`)
     - View Source command (`Ctrl` + `U`, `Cmd` + `U`)
3. **Dynamic User-Specific Floating Watermark:**
   - An animated, semi-transparent watermark containing the logged-in student's **Username**, **Email**, and **IP address** drifts dynamically across the video player area.
   - Because the position shifts randomly every 4.5 seconds, cropping the watermark is impossible, and capturing the stream via external cameras or capture cards immediately leaks the student's credentials, acting as a powerful legal and psychological deterrent.
4. **Media Blocker Overlay & Context Blocker:**
   - Disables standard right-clicks (`contextmenu`) globally across the page to prevent saving the source file.
   - Places a transparent overlay element above the HTML5 video player to block users from dragging, right-clicking, or inspecting the underlying `<video>` node.

---

## 🚀 Key Functional Features

- **Personalized Student Dashboard:**
  - Standard Student Login & Register flows.
  - Dynamic listing of video lectures showing categories and difficulty badges.
- **Video Bookmarking:**
  - Add bookmarks at the exact video playback timestamp with custom titles and detailed learning notes.
  - Hoverable, clickable bookmark markers drawn directly on the player timeline.
  - Edit or delete saved bookmarks.
  - Clicking any bookmark jumps the video directly to that timestamp.
- **"Continue Watching" Progress Tracking:**
  - The portal automatically saves the playback progress (percentage and seconds watched) to the local database on playback updates.
  - Displays the student's watch progress directly on course cards.
  - Shows a "Recently Watched" list.
  - Automatically prompts the student to resume playback from where they left off when re-opening a video.

---

## ⚙️ Setup and Installation Instructions

Ensure you have **Node.js** (v18+) and **NPM** installed on your system.

### 1. Clone & Navigate to Project
```bash
cd "GVCC Assignment"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production (Optional)
To verify files and generate static build bundles:
```bash
npm run build
```

---

## 📝 Demo Walkthrough Checklist

Here is how to test each requirement:

1. **Registration & Login:**
   - Create a user (e.g. username `student1`, email `student1@example.com`).
   - Logging in loads the student catalog.
2. **Watching a Video:**
   - Select the first course.
   - Let the video run.
   - Click back to the catalog. Note the progress bar is filled and the video appears under **Recently Watched**.
   - Click the course again. Note the pop-up notification: *"Resumed playback from [timestamp]"*.
3. **Testing Bookmarks:**
   - Seek to a point in the video (e.g. `00:05`).
   - Enter a Title and Note in the sidebar form and click **Add Bookmark**.
   - Note that the bookmark appears in the sidebar list, and a red dot marker is painted on the video progress bar.
   - Repeat at another timestamp (e.g. `00:10`).
   - Drag or play to another time, then click the `00:05` bookmark in the sidebar. The video player immediately seeks and resumes from `00:05`!
   - Click the edit icon to update a bookmark's title/notes. Click delete to remove.
4. **Testing Screenshot Protection:**
   - Try right-clicking anywhere on the page -> it is blocked.
   - Try pressing `F12` or `Ctrl+Shift+I` -> an alert notifies you that access is restricted.
   - Click outside the browser window (or launch Windows Snipping Tool) -> notice the player instantly blurs out and displays the security warning.
   - Click back into the window -> the warning dismisses, and the video resumes.
   - Note the transparent watermark containing the student credentials floating across the media.

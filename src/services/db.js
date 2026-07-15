// Mock Database Service using LocalStorage
// Pre-seeded with high-quality sample learning videos

const SEED_VIDEOS = [
  {
    id: "intro-web",
    title: "1. Introduction to Web Development & HTML5",
    description: "Learn the foundational components of the web, the structure of HTML, and how web browsers parse and render tags. Perfect for beginners starting their coding journey.",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: 10,
    instructor: "Rahul",
    category: "Web Basics",
    difficulty: "Beginner",
  },
  {
    id: "css-layouts",
    title: "2. Mastering Flexbox, CSS Grid & Responsive UI",
    description: "Deep dive into CSS Layout models. Master modern layout techniques including Flexbox, CSS Grid systems, responsive media queries, and alignment properties.",
    url: "https://vjs.zencdn.net/v/oceans.mp4",
    duration: 46,
    instructor: "Rohith",
    category: "CSS & Design",
    difficulty: "Intermediate",
  },
  {
    id: "js-async",
    title: "3. Understanding JavaScript Promises & Async/Await",
    description: "Unravel asynchronous execution in JavaScript. Learn the Event Loop, microtasks, callbacks, Promise chaining, error handling, and writing clean async/await flows.",
    url: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
    duration: 52,
    instructor: "Siddarth",
    category: "JavaScript",
    difficulty: "Advanced",
  },
  {
    id: "react-hooks",
    title: "4. Practical Guide to React Hooks & Custom Hooks",
    description: "Go beyond state. Learn how to manage side-effects, cache calculations with useMemo, preserve references with useRef, and encapsulate logic in custom hooks.",
    url: "https://www.w3schools.com/html/movie.mp4",
    duration: 32,
    instructor: "Vijay",
    category: "React",
    difficulty: "Intermediate",
  }
];

// Helper to interact with LocalStorage
const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize default DB state if not present
export const initDB = () => {
  if (!localStorage.getItem("users")) {
    setStorageItem("users", []);
  }
  if (!localStorage.getItem("bookmarks")) {
    setStorageItem("bookmarks", []);
  }
  if (!localStorage.getItem("watch_history")) {
    setStorageItem("watch_history", []);
  }
};

// Seeding videos helper (always returns the static list)
export const getVideos = () => {
  return SEED_VIDEOS;
};

export const getVideoById = (id) => {
  return SEED_VIDEOS.find(v => v.id === id) || null;
};

// Bookmark CRUD Operations
export const getBookmarks = (videoId, username) => {
  initDB();
  const allBookmarks = getStorageItem("bookmarks", []);
  return allBookmarks
    .filter(b => b.videoId === videoId && b.username === username)
    .sort((a, b) => a.timestamp - b.timestamp);
};

export const addBookmark = (bookmarkData) => {
  initDB();
  const allBookmarks = getStorageItem("bookmarks", []);
  const newBookmark = {
    id: `bmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    videoId: bookmarkData.videoId,
    username: bookmarkData.username,
    timestamp: bookmarkData.timestamp,
    name: bookmarkData.name || `Bookmark @ ${formatTime(bookmarkData.timestamp)}`,
    notes: bookmarkData.notes || "",
    createdAt: new Date().toISOString()
  };
  allBookmarks.push(newBookmark);
  setStorageItem("bookmarks", allBookmarks);
  return newBookmark;
};

export const updateBookmark = (bookmarkId, updatedData) => {
  initDB();
  const allBookmarks = getStorageItem("bookmarks", []);
  const index = allBookmarks.findIndex(b => b.id === bookmarkId);
  if (index !== -1) {
    allBookmarks[index] = { ...allBookmarks[index], ...updatedData };
    setStorageItem("bookmarks", allBookmarks);
    return allBookmarks[index];
  }
  return null;
};

export const deleteBookmark = (bookmarkId) => {
  initDB();
  const allBookmarks = getStorageItem("bookmarks", []);
  const filtered = allBookmarks.filter(b => b.id !== bookmarkId);
  setStorageItem("bookmarks", filtered);
  return true;
};

// Watch Progress & History
export const getWatchProgress = (videoId, username) => {
  initDB();
  const history = getStorageItem("watch_history", []);
  const record = history.find(h => h.videoId === videoId && h.username === username);
  return record || null;
};

export const saveWatchProgress = (videoId, username, timestamp, duration) => {
  initDB();
  const history = getStorageItem("watch_history", []);
  const index = history.findIndex(h => h.videoId === videoId && h.username === username);
  
  const progress = duration > 0 ? Math.min(Math.round((timestamp / duration) * 100), 100) : 0;
  
  const record = {
    videoId,
    username,
    timestamp,
    duration,
    progress,
    lastWatched: new Date().toISOString()
  };

  if (index !== -1) {
    history[index] = record;
  } else {
    history.push(record);
  }
  setStorageItem("watch_history", history);
  return record;
};

export const getRecentlyWatched = (username) => {
  initDB();
  const history = getStorageItem("watch_history", []);
  const userHistory = history.filter(h => h.username === username);
  
  // Sort by last watched timestamp descending
  userHistory.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
  
  return userHistory.map(record => {
    const video = getVideoById(record.videoId);
    return {
      ...record,
      videoDetails: video
    };
  }).filter(item => item.videoDetails !== null);
};

// Auth Management
export const registerUser = (username, email, password) => {
  initDB();
  const users = getStorageItem("users", []);
  
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    throw new Error("Username or Email already registered.");
  }

  const newUser = { username, email, password };
  users.push(newUser);
  setStorageItem("users", users);
  return { username, email };
};

export const loginUser = (emailOrUsername, password) => {
  initDB();
  const users = getStorageItem("users", []);
  
  // Find user matching either username or email
  const user = users.find(u => 
    (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
     u.username.toLowerCase() === emailOrUsername.toLowerCase()) && 
    u.password === password
  );

  if (!user) {
    throw new Error("Invalid username/email or password.");
  }
  return { username: user.username, email: user.email };
};

// Helper for formatting time (e.g. 125 -> 02:05)
export const formatTime = (secs) => {
  const seconds = Math.floor(secs);
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

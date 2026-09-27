/**
 * storage.js — Centralized localStorage abstraction
 * All raw localStorage access lives here.
 */

const KEYS = {
  USERS: 'todo_users',
  CURRENT_USER: 'todo_current_user',
  TASKS: 'todo_tasks',
  PREFERENCES: 'todo_preferences',
};

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function _remove(key) {
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// ── Users ─────────────────────────────────────────────
export function getUsers() {
  return _read(KEYS.USERS) || [];
}

export function saveUsers(users) {
  return _write(KEYS.USERS, users);
}

export function findUserByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function addUser(user) {
  const users = getUsers();
  users.push(user);
  return saveUsers(users);
}

export function updateUser(updatedUser) {
  const users = getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
  return saveUsers(users);
}

// ── Session ───────────────────────────────────────────
export function getCurrentUser() {
  return _read(KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  return _write(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  _remove(KEYS.CURRENT_USER);
}

// ── Tasks ─────────────────────────────────────────────
function _tasksKey(userId) {
  return `${KEYS.TASKS}_${userId}`;
}

export function getTasks(userId) {
  return _read(_tasksKey(userId)) || [];
}

export function saveTasks(userId, tasks) {
  return _write(_tasksKey(userId), tasks);
}

// ── Preferences ───────────────────────────────────────
function _prefsKey(userId) {
  return `${KEYS.PREFERENCES}_${userId}`;
}

export function getPreferences(userId) {
  return _read(_prefsKey(userId)) || { theme: 'light', sort: 'newest', view: 'grid' };
}

export function savePreferences(userId, prefs) {
  return _write(_prefsKey(userId), prefs);
}

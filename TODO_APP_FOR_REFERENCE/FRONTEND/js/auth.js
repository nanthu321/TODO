/**
 * auth.js — Authentication logic (localStorage-based)
 */

import { getUsers, saveUsers, findUserByEmail, addUser, getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';
import { generateId, validateEmail } from './utils.js';

export function register({ name, email, password }) {
  if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };
  if (!validateEmail(email)) return { ok: false, error: 'Invalid email address.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  if (findUserByEmail(email)) return { ok: false, error: 'An account with this email already exists.' };

  const user = {
    id: generateId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };
  addUser(user);
  return { ok: true, user };
}

export function login({ email, password }) {
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return { ok: false, error: 'Invalid email or password.' };
  const session = { id: user.id, name: user.name, email: user.email };
  setCurrentUser(session);
  return { ok: true, user: session };
}

export function logout() {
  clearCurrentUser();
}

export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

export function redirectIfAuthed() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
}

export { getCurrentUser };

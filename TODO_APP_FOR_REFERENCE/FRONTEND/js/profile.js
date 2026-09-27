/**
 * profile.js — Profile page controller
 */

import { requireAuth, logout } from './auth.js';
import { getUsers, saveUsers, getPreferences, savePreferences } from './storage.js';
import { getStats } from './tasks.js';
import { validateEmail, showToast, showConfirm, formatDate } from './utils.js';

let user;

document.addEventListener('DOMContentLoaded', () => {
  user = requireAuth();
  if (!user) return;

  bootUI();
  loadProfile();
});

function bootUI() {
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = getInitials(user.name));

  setupUserMenu();
  setupMobileMenu();

  document.addEventListener('keydown', e => {
    if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      window.location.href = 'dashboard.html';
    }
  });
}

function loadProfile() {
  const users = getUsers();
  const fullUser = users.find(u => u.id === user.id);
  if (!fullUser) return;

  // Sidebar
  document.getElementById('sidebarName')?.setAttribute('data-text', fullUser.name);
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = fullUser.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = fullUser.email);
  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = getInitials(fullUser.name));

  const memberSince = document.getElementById('memberSince');
  if (memberSince) memberSince.textContent = formatDate(fullUser.createdAt?.split('T')[0]) || 'N/A';

  // Stats
  const stats = getStats(user.id);
  const statMap = { profileStatTotal: stats.total, profileStatCompleted: stats.completed, profileStatActive: stats.active };
  Object.entries(statMap).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // Read-only email field
  const emailField = document.getElementById('profileEmail');
  if (emailField) emailField.textContent = fullUser.email;

  // Prefill name form
  const nameInput = document.getElementById('profileName');
  if (nameInput) nameInput.value = fullUser.name;

  // Profile form submit
  const profileForm = document.getElementById('profileForm');
  profileForm?.addEventListener('submit', e => {
    e.preventDefault();
    handleProfileUpdate(fullUser);
  });

  // Password form submit
  const pwdForm = document.getElementById('passwordForm');
  pwdForm?.addEventListener('submit', e => {
    e.preventDefault();
    handlePasswordChange(fullUser);
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    showConfirm({
      title: 'Sign out?',
      description: 'You will be redirected to the login page.',
      confirmLabel: 'Sign out',
      onConfirm: () => { logout(); window.location.href = 'login.html'; },
    });
  });

  // Mobile logout
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => {
    logout(); window.location.href = 'login.html';
  });

  // Clear data
  document.getElementById('clearDataBtn')?.addEventListener('click', () => {
    showConfirm({
      title: 'Delete all tasks?',
      description: 'This will permanently remove all your tasks. This action cannot be undone.',
      confirmLabel: 'Delete all tasks',
      onConfirm: () => {
        import('./storage.js').then(({ saveTasks }) => {
          saveTasks(user.id, []);
          showToast('All tasks deleted.', 'warning');
          loadProfile();
        });
      },
    });
  });
}

function handleProfileUpdate(fullUser) {
  const nameInput = document.getElementById('profileName');
  const nameError = document.getElementById('profileNameError');
  const name = nameInput?.value.trim();

  if (!name) {
    if (nameError) nameError.textContent = 'Name is required.';
    nameInput?.classList.add('error');
    return;
  }
  if (nameError) nameError.textContent = '';
  nameInput?.classList.remove('error');

  const btn = document.getElementById('profileSaveBtn');
  btn.classList.add('loading'); btn.disabled = true;

  setTimeout(() => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].name = name;
      saveUsers(users);
      // Update session
      import('./storage.js').then(({ setCurrentUser }) => {
        const updated = { ...user, name };
        setCurrentUser(updated);
        user = updated;
        document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = name);
        document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = getInitials(name));
        showToast('Profile updated!', 'success');
      });
    }
    btn.classList.remove('loading'); btn.disabled = false;
  }, 400);
}

function handlePasswordChange(fullUser) {
  const currentPwd = document.getElementById('currentPassword')?.value;
  const newPwd     = document.getElementById('newPassword')?.value;
  const confirmPwd = document.getElementById('confirmNewPassword')?.value;

  const currentErr = document.getElementById('currentPwdError');
  const newErr     = document.getElementById('newPwdError');
  const confirmErr = document.getElementById('confirmPwdError');

  [currentErr, newErr, confirmErr].forEach(el => { if (el) el.textContent = ''; });
  ['currentPassword','newPassword','confirmNewPassword'].forEach(id => document.getElementById(id)?.classList.remove('error'));

  let valid = true;
  if (!currentPwd) { if (currentErr) currentErr.textContent = 'Current password is required.'; document.getElementById('currentPassword')?.classList.add('error'); valid = false; }
  else if (currentPwd !== fullUser.password) { if (currentErr) currentErr.textContent = 'Current password is incorrect.'; document.getElementById('currentPassword')?.classList.add('error'); valid = false; }
  if (!newPwd || newPwd.length < 6) { if (newErr) newErr.textContent = 'New password must be at least 6 characters.'; document.getElementById('newPassword')?.classList.add('error'); valid = false; }
  if (newPwd !== confirmPwd) { if (confirmErr) confirmErr.textContent = 'Passwords do not match.'; document.getElementById('confirmNewPassword')?.classList.add('error'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('passwordSaveBtn');
  btn.classList.add('loading'); btn.disabled = true;

  setTimeout(() => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx].password = newPwd; saveUsers(users); }
    document.getElementById('passwordForm')?.reset();
    showToast('Password changed successfully!', 'success');
    btn.classList.remove('loading'); btn.disabled = false;
  }, 400);
}

// ── User Menu ─────────────────────────────────────────
function setupUserMenu() {
  const menu    = document.getElementById('userMenu');
  const trigger = document.getElementById('userTrigger');
  if (!menu || !trigger) return;

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) { menu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mobileAppNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => { const open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', open); });
  nav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', () => nav.classList.remove('open')));
}

function getInitials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

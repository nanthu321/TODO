/**
 * utils.js — Shared utility functions
 */

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  const due = new Date(dateStr + 'T23:59:59');
  return due < new Date();
}

export function dueDateLabel(dateStr, completed) {
  if (!dateStr) return '';
  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (completed) return formatDate(dateStr);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `Due in ${diff}d`;
  return formatDate(dateStr);
}

export function dueDateClass(dateStr, completed) {
  if (!dateStr || completed) return '';
  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return '';
}

export function sanitize(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function trapFocus(el) {
  const focusable = el.querySelectorAll(
    'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  el.addEventListener('keydown', handler);
  if (first) first.focus();
  return () => el.removeEventListener('keydown', handler);
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

export function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Weak',   level: 1 };
  if (score <= 2) return { label: 'Fair',   level: 2 };
  if (score <= 3) return { label: 'Good',   level: 3 };
  return              { label: 'Strong', level: 4 };
}

/** Show a toast notification */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${icons[type] || icons.info}<span class="toast-msg">${sanitize(message)}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/** Show a confirmation dialog */
export function showConfirm({ title, description, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const existing = document.getElementById('confirmBackdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'confirm-backdrop';
  backdrop.id = 'confirmBackdrop';
  backdrop.setAttribute('role', 'alertdialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'confirmTitle');
  backdrop.setAttribute('aria-describedby', 'confirmDesc');

  backdrop.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2 class="confirm-title" id="confirmTitle">${sanitize(title)}</h2>
      <p class="confirm-desc" id="confirmDesc">${sanitize(description)}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary" id="confirmCancel">Cancel</button>
        <button class="btn btn-danger" id="confirmOk">${sanitize(confirmLabel)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => requestAnimationFrame(() => backdrop.classList.add('open')));

  const removeFocus = trapFocus(backdrop.querySelector('.confirm-dialog'));

  function close() {
    backdrop.classList.remove('open');
    setTimeout(() => { backdrop.remove(); removeFocus?.(); }, 350);
  }

  backdrop.querySelector('#confirmCancel').addEventListener('click', () => { close(); onCancel?.(); });
  backdrop.querySelector('#confirmOk').addEventListener('click', () => { close(); onConfirm?.(); });
  backdrop.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); onCancel?.(); } });
  backdrop.addEventListener('click', e => { if (e.target === backdrop) { close(); onCancel?.(); } });
}

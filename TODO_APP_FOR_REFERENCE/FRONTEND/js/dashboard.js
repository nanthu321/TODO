/**
 * dashboard.js — Dashboard page controller
 */

import { requireAuth, logout, getCurrentUser } from './auth.js';
import { getStats, filterAndSort, createTask, updateTask, deleteTask, toggleTask } from './tasks.js';
import { getPreferences, savePreferences } from './storage.js';
import { debounce, dueDateLabel, dueDateClass, isOverdue, sanitize, showToast, showConfirm, trapFocus } from './utils.js';

// ── State ────────────────────────────────────────────
let user, prefs;
let state = { search: '', filter: 'all', sort: 'newest' };
let taskModal = { open: false, mode: 'create', taskId: null };

// ── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  user = requireAuth();
  if (!user) return;

  prefs = getPreferences(user.id);
  state.sort = prefs.sort || 'newest';

  bootUI();
  renderAll();
});

function bootUI() {
  // User info
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = getInitials(user.name));

  // Greeting
  const greetEl = document.getElementById('greeting');
  if (greetEl) {
    const h = new Date().getHours();
    const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    greetEl.textContent = `${tod}, ${user.name.split(' ')[0]}.`;
  }

  // Sort select
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) { sortSel.value = state.sort; sortSel.addEventListener('change', () => { state.sort = sortSel.value; prefs.sort = state.sort; savePreferences(user.id, prefs); renderTasks(); }); }

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      state.filter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Header search
  const searchInput = document.getElementById('headerSearch');
  const searchClear = document.getElementById('searchClear');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      state.search = searchInput.value.trim();
      searchClear.classList.toggle('visible', !!state.search);
      renderTasks();
    }, 200));
    searchClear?.addEventListener('click', () => {
      searchInput.value = ''; state.search = '';
      searchClear.classList.remove('visible');
      searchInput.focus();
      renderTasks();
    });
  }

  // Add task button(s)
  document.querySelectorAll('[data-action="open-task-modal"]').forEach(btn => {
    btn.addEventListener('click', () => openTaskModal('create'));
  });

  // Modal
  setupModal();

  // User menu
  setupUserMenu();

  // Mobile menu
  setupMobileMenu();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeTaskModal();
    if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
      openTaskModal('create');
    }
  });
}

// ── Render ────────────────────────────────────────────
function renderAll() {
  renderStats();
  renderTasks();
}

function renderStats() {
  const s = getStats(user.id);
  document.getElementById('statTotal')?.setAttribute('data-val', s.total);
  document.getElementById('statActive')?.setAttribute('data-val', s.active);
  document.getElementById('statCompleted')?.setAttribute('data-val', s.completed);
  document.getElementById('statOverdue')?.setAttribute('data-val', s.overdue);

  animateCount('statTotal',     s.total);
  animateCount('statActive',    s.active);
  animateCount('statCompleted', s.completed);
  animateCount('statOverdue',   s.overdue);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  const step = target > current ? 1 : -1;
  let v = current;
  const interval = setInterval(() => {
    v += step; el.textContent = v;
    if (v === target) clearInterval(interval);
  }, 30);
}

function renderTasks() {
  const tasks = filterAndSort(user.id, state);
  const list  = document.getElementById('taskList');
  if (!list) return;

  if (tasks.length === 0) {
    list.innerHTML = getEmptyStateHTML();
    return;
  }

  list.innerHTML = tasks.map(t => taskCardHTML(t)).join('');

  // Bind card events
  list.querySelectorAll('[data-task-id]').forEach(card => {
    const id = card.dataset.taskId;

    // Checkbox
    card.querySelector('.task-checkbox-btn')?.addEventListener('click', () => handleToggle(id));

    // Edit
    card.querySelector('[data-action="edit"]')?.addEventListener('click', () => openTaskModal('edit', id));

    // Delete
    card.querySelector('[data-action="delete"]')?.addEventListener('click', () => handleDelete(id));

    // Keyboard on card title
    card.querySelector('.task-checkbox-btn')?.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleToggle(id); }
    });
  });
}

// ── Task Card HTML ────────────────────────────────────
function taskCardHTML(task) {
  const isComplete = task.completed;
  const overdueTask = isOverdue(task.dueDate, task.completed);
  const dateLabel   = dueDateLabel(task.dueDate, task.completed);
  const dateCls     = dueDateClass(task.dueDate, task.completed);

  const priorityBadge = {
    high:   `<span class="badge badge-high">● High</span>`,
    medium: `<span class="badge badge-medium">● Medium</span>`,
    low:    `<span class="badge badge-low">● Low</span>`,
  }[task.priority] || '';

  const dueBadge = dateLabel
    ? `<span class="task-due ${dateCls}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${sanitize(dateLabel)}
      </span>` : '';

  return `
    <article class="task-card ${isComplete ? 'completed' : ''} ${overdueTask ? 'overdue' : ''}" data-task-id="${task.id}" aria-label="Task: ${sanitize(task.title)}">
      <button class="task-checkbox-btn ${isComplete ? 'checked' : ''}" aria-label="${isComplete ? 'Mark incomplete' : 'Mark complete'}" aria-pressed="${isComplete}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      </button>

      <div class="task-body">
        <h3 class="task-title">${sanitize(task.title)}</h3>
        ${task.description ? `<p class="task-description">${sanitize(task.description)}</p>` : ''}
        <div class="task-meta">
          ${priorityBadge}
          <span class="badge badge-category">${sanitize(task.category)}</span>
          ${dueBadge}
        </div>
      </div>

      <div class="task-actions" role="group" aria-label="Task actions">
        <button class="task-action-btn" data-action="edit" aria-label="Edit task: ${sanitize(task.title)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="task-action-btn delete" data-action="delete" aria-label="Delete task: ${sanitize(task.title)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </article>
  `;
}

// ── Empty States ──────────────────────────────────────
function getEmptyStateHTML() {
  const { filter, search } = state;

  if (search) return emptyHTML(
    `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    'No results found',
    `No tasks match "<strong>${sanitize(search)}</strong>". Try a different search term.`
  );

  const states = {
    completed: ['<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', 'No completed tasks yet', 'Complete your first task and it will appear here.'],
    overdue:   ['<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', "You're all caught up!", 'No overdue tasks. Great job staying on top of your work.'],
    active:    ['<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>', 'All tasks are done!', "You've completed everything. Add a new task to keep the momentum going."],
    all:       ['<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>', "You're all caught up.", 'Create your first task and start organizing your day.'],
  };

  const [icon, title, desc] = states[filter] || states.all;
  return emptyHTML(icon, title, desc, true);
}

function emptyHTML(icon, title, desc, showBtn = false) {
  return `
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">${icon}</div>
      <h3 class="empty-title">${title}</h3>
      <p class="empty-desc">${desc}</p>
      ${showBtn ? `<button class="btn btn-primary" data-action="open-task-modal">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create Task
      </button>` : ''}
    </div>
  `;
}

// ── Task Actions ──────────────────────────────────────
function handleToggle(taskId) {
  const result = toggleTask(user.id, taskId);
  if (!result.ok) return;
  const msg = result.task.completed ? 'Task marked complete!' : 'Task marked active.';
  showToast(msg, result.task.completed ? 'success' : 'info');
  renderAll();
}

function handleDelete(taskId) {
  showConfirm({
    title: 'Delete this task?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    onConfirm: () => {
      deleteTask(user.id, taskId);
      showToast('Task deleted.', 'info');
      renderAll();
    },
  });
}

// ── Modal ─────────────────────────────────────────────
function setupModal() {
  const backdrop = document.getElementById('taskModalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  const form     = document.getElementById('taskForm');

  closeBtn?.addEventListener('click', closeTaskModal);
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) closeTaskModal(); });
  form?.addEventListener('submit', handleTaskSubmit);

  // Category chips
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const catInput = document.getElementById('taskCategory');
      if (catInput) { catInput.value = chip.dataset.cat; catInput.focus(); }
    });
  });
}

function openTaskModal(mode, taskId = null) {
  const backdrop = document.getElementById('taskModalBackdrop');
  const title    = document.getElementById('modalTitle');
  const form     = document.getElementById('taskForm');
  if (!backdrop || !form) return;

  taskModal = { open: true, mode, taskId };
  form.reset();
  clearModalErrors();

  if (mode === 'edit' && taskId) {
    import('./storage.js').then(({ getTasks }) => {
      const tasks = getTasks(user.id);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      title.textContent = 'Edit Task';
      document.getElementById('taskTitle').value       = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('taskDueDate').value     = task.dueDate;
      document.getElementById('taskCategory').value    = task.category;
      const pr = form.querySelector(`input[name="priority"][value="${task.priority}"]`);
      if (pr) pr.checked = true;
    });
  } else {
    title.textContent = 'Create Task';
    const medRadio = form.querySelector('input[name="priority"][value="medium"]');
    if (medRadio) medRadio.checked = true;
  }

  backdrop.classList.add('open');
  const removeTrap = trapFocus(backdrop.querySelector('.modal'));
  backdrop._removeTrap = removeTrap;

  backdrop.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') { closeTaskModal(); backdrop.removeEventListener('keydown', escHandler); }
  });
}

function closeTaskModal() {
  const backdrop = document.getElementById('taskModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  backdrop._removeTrap?.();
  taskModal = { open: false, mode: 'create', taskId: null };
}

function handleTaskSubmit(e) {
  e.preventDefault();
  clearModalErrors();

  const title       = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const priority    = document.querySelector('input[name="priority"]:checked')?.value || 'medium';
  const dueDate     = document.getElementById('taskDueDate').value;
  const category    = document.getElementById('taskCategory').value.trim() || 'General';

  if (!title) {
    setModalError('taskTitleError', 'Task title is required.');
    document.getElementById('taskTitle').focus();
    return;
  }

  const btn = document.getElementById('taskSubmitBtn');
  btn.classList.add('loading'); btn.disabled = true;

  setTimeout(() => {
    if (taskModal.mode === 'edit' && taskModal.taskId) {
      const result = updateTask(user.id, taskModal.taskId, { title, description, priority, dueDate, category });
      if (result.ok) { showToast('Task updated!', 'success'); closeTaskModal(); renderAll(); }
    } else {
      const result = createTask(user.id, { title, description, priority, dueDate, category });
      if (result.ok) { showToast('Task created!', 'success'); closeTaskModal(); renderAll(); }
    }
    btn.classList.remove('loading'); btn.disabled = false;
  }, 300);
}

function setModalError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearModalErrors() {
  document.querySelectorAll('.modal .form-error').forEach(el => el.textContent = '');
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
    if (!menu.contains(e.target)) {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    showConfirm({
      title: 'Sign out?',
      description: 'You will be redirected to the login page.',
      confirmLabel: 'Sign out',
      onConfirm: () => {
        logout();
        window.location.href = 'login.html';
      },
    });
  });
}

// ── Mobile Menu ───────────────────────────────────────
function setupMobileMenu() {
  const btn  = document.getElementById('mobileMenuBtn');
  const nav  = document.getElementById('mobileAppNav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  nav.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ── Helpers ───────────────────────────────────────────
function getInitials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

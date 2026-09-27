/**
 * tasks.js — Task business logic
 */

import { getTasks, saveTasks } from './storage.js';
import { generateId, isOverdue } from './utils.js';

export function createTask(userId, { title, description, priority, dueDate, category }) {
  if (!title || !title.trim()) return { ok: false, error: 'Title is required.' };
  const tasks = getTasks(userId);
  const task = {
    id: generateId(),
    userId,
    title: title.trim(),
    description: (description || '').trim(),
    priority: priority || 'medium',
    category: (category || 'General').trim(),
    dueDate: dueDate || '',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  saveTasks(userId, tasks);
  return { ok: true, task };
}

export function updateTask(userId, taskId, fields) {
  const tasks = getTasks(userId);
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return { ok: false, error: 'Task not found.' };
  tasks[idx] = { ...tasks[idx], ...fields, updatedAt: new Date().toISOString() };
  saveTasks(userId, tasks);
  return { ok: true, task: tasks[idx] };
}

export function deleteTask(userId, taskId) {
  let tasks = getTasks(userId);
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks(userId, tasks);
  return { ok: true };
}

export function toggleTask(userId, taskId) {
  const tasks = getTasks(userId);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return { ok: false };
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveTasks(userId, tasks);
  return { ok: true, task };
}

export function getStats(userId) {
  const tasks = getTasks(userId);
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = tasks.filter(t => !t.completed).length;
  const overdue = tasks.filter(t => isOverdue(t.dueDate, t.completed)).length;
  return { total, completed, active, overdue };
}

export function filterAndSort(userId, { search = '', filter = 'all', sort = 'newest' }) {
  let tasks = getTasks(userId);

  // Search
  const q = search.toLowerCase();
  if (q) {
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  // Filter
  switch (filter) {
    case 'active':   tasks = tasks.filter(t => !t.completed); break;
    case 'completed': tasks = tasks.filter(t => t.completed); break;
    case 'overdue':  tasks = tasks.filter(t => isOverdue(t.dueDate, t.completed)); break;
    case 'high':     tasks = tasks.filter(t => t.priority === 'high'); break;
    case 'medium':   tasks = tasks.filter(t => t.priority === 'medium'); break;
    case 'low':      tasks = tasks.filter(t => t.priority === 'low'); break;
  }

  // Sort
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  switch (sort) {
    case 'newest':
      tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    case 'oldest':
      tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
    case 'dueDate':
      tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }); break;
    case 'priority':
      tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]); break;
    case 'alpha':
      tasks.sort((a, b) => a.title.localeCompare(b.title)); break;
  }

  return tasks;
}

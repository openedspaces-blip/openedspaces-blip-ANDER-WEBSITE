// lib/devStore.js
// In-memory storage used ONLY when Supabase is not configured, so the app,
// tests, and local demos work out of the box. Data does not persist across
// process restarts and is never used when Supabase is configured.
const crypto = require('crypto');

const usersByEmail = new Map();
const profilesById = new Map();
const completionsById = new Map();
const goalsByUserId = new Map();

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function defaultProfile() {
  return {
    progress: 0,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    nextLesson: 'Listening A1',
    xp: 0,
    level: 1,
    badges: [],
    accessTier: 'free',
    preferredLanguage: 'english',
    preferredLevel: 'A1'
  };
}

function createUser({ email, password, name }) {
  const id = crypto.randomUUID();
  const user = {
    id,
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    passwordHash: hashPassword(password)
  };
  usersByEmail.set(user.email, user);
  profilesById.set(id, defaultProfile());
  completionsById.set(id, new Set());
  return user;
}

function findUserByEmail(email) {
  return usersByEmail.get((email || '').toLowerCase()) || null;
}

function verifyPassword(user, password) {
  return user.passwordHash === hashPassword(password);
}

function getProfile(userId) {
  if (!profilesById.has(userId)) profilesById.set(userId, defaultProfile());
  return profilesById.get(userId);
}

function saveProfile(userId, patch) {
  const current = getProfile(userId);
  const next = { ...current, ...patch };
  profilesById.set(userId, next);
  return next;
}

function getCompletedSlugs(userId) {
  if (!completionsById.has(userId)) completionsById.set(userId, new Set());
  return completionsById.get(userId);
}

function markCompleted(userId, slug) {
  getCompletedSlugs(userId).add(slug);
}

function getGoal(userId) {
  return goalsByUserId.get(userId) || null;
}

function saveGoal(userId, goalKey) {
  const goal = { id: userId, userId, goalKey, selectedAt: new Date().toISOString(), completedAt: null };
  goalsByUserId.set(userId, goal);
  return goal;
}

function completeGoal(userId) {
  const goal = getGoal(userId);
  if (!goal) return null;
  goal.completedAt = new Date().toISOString();
  goalsByUserId.set(userId, goal);
  return goal;
}

function deleteGoal(userId) {
  goalsByUserId.delete(userId);
}

module.exports = {
  createUser,
  findUserByEmail,
  verifyPassword,
  getProfile,
  saveProfile,
  getCompletedSlugs,
  markCompleted,
  getGoal,
  saveGoal,
  completeGoal,
  deleteGoal
};

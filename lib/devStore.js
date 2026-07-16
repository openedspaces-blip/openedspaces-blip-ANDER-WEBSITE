// lib/devStore.js
// In-memory storage used ONLY when Supabase is not configured, so the app,
// tests, and local demos work out of the box. Data does not persist across
// process restarts and is never used when Supabase is configured.
const crypto = require('crypto');

const usersByEmail = new Map();
const usersByUsername = new Map();
const profilesById = new Map();
const completionsById = new Map();
const goalsByUserId = new Map();

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function defaultProfile(username = null) {
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
    preferredLevel: 'A1',
    bridgeLanguage: 'spanish',
    username
  };
}

function createUser({ email, password, name, username }) {
  const id = crypto.randomUUID();
  const trimmedUsername = username ? String(username).trim() : null;
  const usernameNormalized = trimmedUsername ? trimmedUsername.toLowerCase() : null;
  const user = {
    id,
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    username: trimmedUsername,
    usernameNormalized,
    passwordHash: hashPassword(password)
  };
  usersByEmail.set(user.email, user);
  if (usernameNormalized) usersByUsername.set(usernameNormalized, user);
  profilesById.set(id, defaultProfile(trimmedUsername));
  completionsById.set(id, new Set());
  return user;
}

// Used only by the username onboarding flow (profilesService-equivalent
// path for the no-Supabase/local dev fallback) - keeps usersByUsername in
// sync so a subsequent login-by-username resolves correctly.
function setUsername(userId, username, usernameNormalized) {
  saveProfile(userId, { username });
  for (const user of usersByEmail.values()) {
    if (user.id === userId) {
      user.username = username;
      user.usernameNormalized = usernameNormalized;
      usersByUsername.set(usernameNormalized, user);
      break;
    }
  }
}

function findUserByEmail(email) {
  return usersByEmail.get((email || '').toLowerCase()) || null;
}

function findUserByUsername(usernameNormalized) {
  return usersByUsername.get((usernameNormalized || '').toLowerCase()) || null;
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
  const goal = {
    id: userId,
    userId,
    goalKey,
    selectedAt: new Date().toISOString(),
    completedAt: null
  };
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
  findUserByUsername,
  setUsername,
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

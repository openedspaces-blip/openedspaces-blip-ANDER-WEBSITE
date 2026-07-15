// lib/goalsService.js
// Reads/writes public.user_goals - one row per user (unique(user_id) in
// supabase/migrations/202607120001_normalized_courses_schema.sql:143-149),
// replacing the frontend's previous localStorage-only goal storage. Same
// Supabase-or-devStore pattern as lessonsService.js.
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const devStore = require('./devStore');

const VALID_GOAL_KEYS = new Set(['daily', 'conversation', 'exam']);

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function validateGoalKey(goalKey) {
  if (!VALID_GOAL_KEYS.has(goalKey)) {
    throw httpError('Objetivo no válido.', 400);
  }
}

function shapeGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    goalKey: row.goal_key,
    selectedAt: row.selected_at,
    completedAt: row.completed_at ?? null
  };
}

function shapeDevGoal(goal) {
  if (!goal) return null;
  return {
    id: goal.id,
    goalKey: goal.goalKey,
    selectedAt: goal.selectedAt,
    completedAt: goal.completedAt ?? null
  };
}

async function getGoal(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return shapeGoal(data);
  }

  return shapeDevGoal(devStore.getGoal(userId));
}

// user_goals has a UNIQUE(user_id) constraint - there is only ever one goal
// per user, so "create" is an upsert keyed on the authenticated user's id
// (never a client-supplied id). completed_at is always reset to null here:
// the goal-picker cards call this on every pick, including right after a
// previous goal was marked complete, and upsert only touches columns it's
// given - without an explicit reset the new goal would silently inherit the
// old one's completed_at.
async function upsertGoal(userId, goalKey) {
  validateGoalKey(goalKey);

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_goals')
      .upsert(
        {
          user_id: userId,
          goal_key: goalKey,
          selected_at: new Date().toISOString(),
          completed_at: null
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle();
    if (error) throw httpError('No se pudo guardar el objetivo.', 500);
    return shapeGoal(data);
  }

  return shapeDevGoal(devStore.saveGoal(userId, goalKey));
}

// Ownership is always re-checked against the authenticated userId - the
// route-level :id is never trusted on its own. Editing the goal_key leaves
// completed_at untouched - that's a distinct action from completing one.
async function updateGoal(userId, goalId, goalKey) {
  validateGoalKey(goalKey);

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_goals')
      .update({ goal_key: goalKey, selected_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) throw httpError('No se pudo actualizar el objetivo.', 500);
    if (!data) throw httpError('Objetivo no encontrado.', 404);
    return shapeGoal(data);
  }

  const existing = devStore.getGoal(userId);
  if (!existing || existing.id !== goalId) throw httpError('Objetivo no encontrado.', 404);
  return shapeDevGoal(devStore.saveGoal(userId, goalKey));
}

// Marks the current goal as completed without deleting it. Same ownership
// pattern as updateGoal/deleteGoal - a goalId that isn't the caller's own 404s.
async function completeGoal(userId, goalId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_goals')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) throw httpError('No se pudo completar el objetivo.', 500);
    if (!data) throw httpError('Objetivo no encontrado.', 404);
    return shapeGoal(data);
  }

  const existing = devStore.getGoal(userId);
  if (!existing || existing.id !== goalId) throw httpError('Objetivo no encontrado.', 404);
  return shapeDevGoal(devStore.completeGoal(userId));
}

async function deleteGoal(userId, goalId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId)
      .select();
    if (error) throw httpError('No se pudo eliminar el objetivo.', 500);
    if (!data || data.length === 0) throw httpError('Objetivo no encontrado.', 404);
    return { ok: true };
  }

  const existing = devStore.getGoal(userId);
  if (!existing || existing.id !== goalId) throw httpError('Objetivo no encontrado.', 404);
  devStore.deleteGoal(userId);
  return { ok: true };
}

module.exports = { getGoal, upsertGoal, updateGoal, deleteGoal, completeGoal, VALID_GOAL_KEYS };

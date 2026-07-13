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
  return { id: row.id, goalKey: row.goal_key, selectedAt: row.selected_at };
}

async function getGoal(userId) {
  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('user_goals').select('*').eq('user_id', userId).maybeSingle();
    return shapeGoal(data);
  }

  const goal = devStore.getGoal(userId);
  return goal ? { id: goal.id, goalKey: goal.goalKey, selectedAt: goal.selectedAt } : null;
}

// user_goals has a UNIQUE(user_id) constraint - there is only ever one goal
// per user, so "create" is an upsert keyed on the authenticated user's id
// (never a client-supplied id).
async function upsertGoal(userId, goalKey) {
  validateGoalKey(goalKey);

  if (config.isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_goals')
      .upsert({ user_id: userId, goal_key: goalKey, selected_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .maybeSingle();
    if (error) throw httpError('No se pudo guardar el objetivo.', 500);
    return shapeGoal(data);
  }

  const goal = devStore.saveGoal(userId, goalKey);
  return { id: goal.id, goalKey: goal.goalKey, selectedAt: goal.selectedAt };
}

// Ownership is always re-checked against the authenticated userId - the
// route-level :id is never trusted on its own.
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
  const goal = devStore.saveGoal(userId, goalKey);
  return { id: goal.id, goalKey: goal.goalKey, selectedAt: goal.selectedAt };
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

module.exports = { getGoal, upsertGoal, updateGoal, deleteGoal, VALID_GOAL_KEYS };

const fs = require('fs');
const path = require('path');
const { supabaseClient, supabaseAdmin, getSupabaseConfigError, ensureProfilesTable } = require('./supabase');

function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function getBearerToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

function isProfilesTableError(error) {
  return /profiles table is not ready|public\.profiles|schema cache|relation .*profiles/i.test(error?.message || '');
}

function isLessonsTableError(error) {
  return /public\.lessons|public\.lesson_completions|schema cache|relation .*lessons|relation .*lesson_completions/i.test(error?.message || '');
}

function readSeedLessons() {
  const seedPath = path.resolve(__dirname, 'seed-lessons.json');
  return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
}

function publicLesson(lesson, completedSlugs = new Set()) {
  const content = lesson.content_json || {};
  return {
    slug: lesson.slug,
    targetLanguage: lesson.target_language || content.language_key || 'english',
    level: lesson.level,
    skill: lesson.skill,
    title: lesson.title,
    description: lesson.description,
    orderIndex: lesson.order_index ?? lesson.orderIndex ?? 0,
    estimatedMinutes: lesson.estimated_minutes ?? lesson.estimatedMinutes ?? 10,
    xpReward: lesson.xp_reward ?? content.xp_reward ?? 20,
    isFree: lesson.is_free ?? lesson.isFree ?? true,
    accessTier: lesson.access_tier || lesson.accessTier || ((lesson.is_free ?? lesson.isFree ?? true) ? 'free' : 'premium'),
    paymentPriceUsd: Number(lesson.payment_price_usd ?? lesson.paymentPriceUsd ?? 5.95),
    locked: !(lesson.is_free ?? lesson.isFree ?? true),
    accessLabel: (lesson.is_free ?? lesson.isFree ?? true) ? 'Gratis' : 'Premium USD 5.95',
    completed: completedSlugs.has(lesson.slug),
    intro: content.intro,
    mission: content.mission,
    grammar: content.grammar,
    phrases: content.phrases || [],
    reading: content.reading || null,
    vocabulary: content.vocabulary || [],
    dialogue: content.dialogue || [],
    exercises: content.exercises || []
  };
}

function nextLessonTitle(lessons, completedSlugs = new Set()) {
  const next = lessons.find((lesson) => !completedSlugs.has(lesson.slug));
  return next ? `${next.title} ${next.level}` : 'Ruta A1 completada';
}

async function getCompletedSlugs(admin, userId) {
  if (!userId) return new Set();
  const { data, error } = await admin
    .from('lesson_completions')
    .select('lessons(slug)')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Could not read completed lessons: ${error.message}`);
  }

  return new Set((data || []).map((row) => row.lessons?.slug).filter(Boolean));
}

async function readLessons(admin, filters = {}) {
  let query = admin
    .from('lessons')
    .select('id, slug, target_language, level, skill, title, description, order_index, is_free, is_published, estimated_minutes, xp_reward, access_tier, payment_price_usd, content_json')
    .order('order_index', { ascending: true });

  if (filters.language || filters.target_language) query = query.eq('target_language', filters.language || filters.target_language);
  if (filters.level) query = query.eq('level', filters.level);
  if (filters.skill) query = query.eq('skill', filters.skill);
  if (filters.slug) query = query.eq('slug', filters.slug);
  query = query.eq('is_published', true);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Could not read lessons: ${error.message}`);
  }
  return data || [];
}

function readSeedLessonsWithFilters(filters = {}) {
  return readSeedLessons()
    .filter((lesson) => !filters.language && !filters.target_language || lesson.target_language === (filters.language || filters.target_language))
    .filter((lesson) => !filters.level || lesson.level === filters.level)
    .filter((lesson) => !filters.skill || lesson.skill === filters.skill)
    .filter((lesson) => !filters.slug || lesson.slug === filters.slug)
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
}

function defaultProfileForUser(user, name) {
  return {
    full_name: name || user?.user_metadata?.name || user?.email?.split('@')[0] || user?.email || 'Usuario',
    email: user?.email || null,
    progress: 0,
    streak: 0,
    next_lesson: 'Listening A1'
  };
}

function sendProfilesSetupError(res, error) {
  return sendJson(res, 503, {
    error: error.message,
    manualAction: 'Run SUPABASE_RUN_THIS.sql in the Supabase SQL editor, or set SUPABASE_DATABASE_URL and run npm run db:setup.'
  });
}

function publicUser(user, profile) {
  return {
    id: user?.id,
    email: user?.email,
    name: profile?.full_name || user?.user_metadata?.name || user?.email
  };
}

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    return { error: 'Missing Authorization Bearer token.' };
  }

  const client = supabaseClient();
  if (!client) {
    return { error: 'Supabase is not configured.' };
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return { error: error?.message || 'Invalid or expired session.' };
  }

  return { user: data.user, token };
}

async function upsertProfile(admin, user, name) {
  const fullName = name || user?.user_metadata?.name || user?.email?.split('@')[0] || user?.email;
  const profile = {
    id: user.id,
    full_name: fullName,
    email: user.email,
    progress: 0,
    streak: 0,
    next_lesson: 'Listening A1'
  };

  const { data, error } = await admin
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select('full_name, email, progress, streak, next_lesson')
    .single();

  if (error) {
    throw new Error(`Could not create user profile: ${error.message}`);
  }

  return data;
}

async function getProfile(admin, userId) {
  const { data, error } = await admin
    .from('profiles')
    .select('full_name, email, progress, streak, next_lesson')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read user profile: ${error.message}`);
  }

  return data;
}

async function checkProfilesTable(admin) {
  const { error } = await admin
    .from('profiles')
    .select('id')
    .limit(1);

  if (error) {
    throw new Error(`Profiles table is not ready: ${error.message}`);
  }
}

async function handleHealth(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});

  const configError = getSupabaseConfigError();
  if (configError) {
    return sendJson(res, 200, { ok: true, configured: false, error: configError });
  }

  try {
    await ensureProfilesTable();
    const admin = supabaseAdmin();
    const { error } = await admin.auth.admin.listUsers({ perPage: 1 });

    if (error) {
      return sendJson(res, 200, {
        ok: true,
        configured: false,
        error: `Supabase auth connection failed: ${error.message}`
      });
    }

    let profilesTableChecked = true;
    let warning;
    try {
      await checkProfilesTable(admin);
    } catch (profilesError) {
      profilesTableChecked = false;
      warning = profilesError.message;
    }

    return sendJson(res, 200, {
      ok: true,
      configured: true,
      warning,
      manualAction: profilesTableChecked ? undefined : 'Run SUPABASE_RUN_THIS.sql in the Supabase SQL editor, or set SUPABASE_DATABASE_URL and run npm run db:setup.',
      services: {
        supabaseAuth: true,
        profilesTableChecked
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return sendJson(res, 500, {
      ok: false,
      configured: false,
      error: error.message || 'Health check failed.'
    });
  }
}

async function handleRegister(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const { name, email, password } = await getJsonBody(req);
    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendJson(res, 400, { error: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
    }

    const admin = supabaseAdmin();
    await ensureProfilesTable();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0] }
    });

    if (error) return sendJson(res, 400, { error: error.message });

    let profile;
    try {
      profile = await upsertProfile(admin, data.user, name);
    } catch (profileError) {
      if (isProfilesTableError(profileError)) {
        profile = defaultProfileForUser(data.user, name);
      } else if (data.user?.id) {
        await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
        throw profileError;
      }
    }
    if (!profile) profile = defaultProfileForUser(data.user, name);
    let login;
    try {
      login = await supabaseClient().auth.signInWithPassword({ email, password });
      if (login.error) throw login.error;
    } catch (loginError) {
      console.error('Post-register sign-in failed:', loginError.message);
      return sendJson(res, 201, {
        user: publicUser(data.user, profile),
        session: null
      });
    }

    return sendJson(res, 201, {
      user: publicUser(data.user, profile),
      session: login.data?.session ? {
        access_token: login.data.session.access_token,
        refresh_token: login.data.session.refresh_token,
        expires_in: login.data.session.expires_in,
        token_type: login.data.session.token_type || 'bearer'
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (isProfilesTableError(error)) {
      return sendProfilesSetupError(res, error);
    }
    return sendJson(res, 500, { error: error.message || 'Registration failed.' });
  }
}

async function handleLogin(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const { email, password } = await getJsonBody(req);
    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email and password are required.' });
    }

    const client = supabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return sendJson(res, 401, { error: error.message });

    let profile;
    try {
      const admin = supabaseAdmin();
      profile = await getProfile(admin, data.user.id);
      if (!profile) {
        profile = await upsertProfile(admin, data.user);
      }
    } catch (profileError) {
      if (!isProfilesTableError(profileError)) {
        throw profileError;
      }
      profile = defaultProfileForUser(data.user);
    }

    return sendJson(res, 200, {
      user: publicUser(data.user, profile),
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type || 'bearer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (isProfilesTableError(error)) {
      return sendProfilesSetupError(res, error);
    }
    return sendJson(res, 500, { error: error.message || 'Login failed.' });
  }
}

async function handleLogout(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const token = getBearerToken(req);
    if (token) {
      await supabaseAdmin().auth.admin.signOut(token, 'global').catch(() => {});
    }
    return sendJson(res, 200, { success: true });
  } catch {
    return sendJson(res, 200, { success: true });
  }
}

async function handleRefreshToken(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const { refresh_token: refreshToken } = await getJsonBody(req);
    if (!refreshToken) {
      return sendJson(res, 400, { error: 'Refresh token is required.' });
    }

    const { data, error } = await supabaseClient().auth.refreshSession({ refresh_token: refreshToken });
    if (error) return sendJson(res, 401, { error: error.message });

    return sendJson(res, 200, {
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type || 'bearer'
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return sendJson(res, 500, { error: error.message || 'Token refresh failed.' });
  }
}

async function handleUser(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const auth = await getAuthenticatedUser(req);
    if (auth.error) return sendJson(res, 401, { error: auth.error });

    let profile;
    try {
      profile = await getProfile(supabaseAdmin(), auth.user.id);
    } catch (profileError) {
      if (!isProfilesTableError(profileError)) {
        throw profileError;
      }
      profile = defaultProfileForUser(auth.user);
    }
    return sendJson(res, 200, { user: publicUser(auth.user, profile) });
  } catch (error) {
    console.error('User fetch error:', error);
    if (isProfilesTableError(error)) {
      return sendProfilesSetupError(res, error);
    }
    return sendJson(res, 500, { error: error.message || 'Could not read user.' });
  }
}

async function handleProgress(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });

  const configError = getSupabaseConfigError();
  if (configError) return sendJson(res, 500, { error: configError });

  try {
    const auth = await getAuthenticatedUser(req);
    if (auth.error) return sendJson(res, 401, { error: auth.error });

    let profile;
    try {
      await ensureProfilesTable();
      const admin = supabaseAdmin();
      profile = await getProfile(admin, auth.user.id);
      if (!profile) {
        profile = await upsertProfile(admin, auth.user);
      }
    } catch (profileError) {
      if (!isProfilesTableError(profileError)) {
        throw profileError;
      }
      profile = defaultProfileForUser(auth.user);
    }

    return sendJson(res, 200, {
      progress: profile.progress ?? 0,
      streak: profile.streak ?? 0,
      nextLesson: profile.next_lesson || 'Listening A1'
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    if (isProfilesTableError(error)) {
      return sendProfilesSetupError(res, error);
    }
    return sendJson(res, 500, { error: error.message || 'Could not read progress.' });
  }
}

async function handleLessons(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });

  const filters = {
    language: req.query?.language || req.query?.target_language,
    level: req.query?.level,
    skill: req.query?.skill
  };

  try {
    let completedSlugs = new Set();
    const admin = supabaseAdmin();
    if (!admin) {
      const lessons = readSeedLessonsWithFilters(filters);
      return sendJson(res, 200, {
        lessons: lessons.map((lesson) => publicLesson(lesson)),
        source: 'seed'
      });
    }

    const auth = await getAuthenticatedUser(req);
    if (auth.user) {
      try {
        completedSlugs = await getCompletedSlugs(admin, auth.user.id);
      } catch (completionError) {
        if (!isLessonsTableError(completionError)) throw completionError;
      }
    }

    let lessons;
    let source = 'supabase';
    try {
      lessons = await readLessons(admin, filters);
    } catch (lessonError) {
      console.warn('Falling back to seed lessons:', lessonError.message);
      lessons = readSeedLessonsWithFilters(filters);
      source = 'seed';
    }

    return sendJson(res, 200, {
      lessons: lessons.map((lesson) => publicLesson(lesson, completedSlugs)),
      source
    });
  } catch (error) {
    console.error('Lessons fetch error:', error);
    return sendJson(res, 500, { error: error.message || 'Could not read lessons.' });
  }
}

async function handleLesson(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });

  const slug = req.params?.slug;
  if (!slug) return sendJson(res, 400, { error: 'Lesson slug is required.' });

  try {
    let lesson;
    const admin = supabaseAdmin();
    if (!admin) {
      lesson = readSeedLessonsWithFilters({ slug })[0];
      if (!lesson) return sendJson(res, 404, { error: 'Lesson not found.' });
      return sendJson(res, 200, { lesson: publicLesson(lesson) });
    }

    try {
      lesson = (await readLessons(admin, { slug }))[0];
    } catch (lessonError) {
      console.warn('Falling back to seed lesson:', lessonError.message);
      lesson = readSeedLessonsWithFilters({ slug })[0];
    }

    if (!lesson) return sendJson(res, 404, { error: 'Lesson not found.' });
    return sendJson(res, 200, { lesson: publicLesson(lesson) });
  } catch (error) {
    console.error('Lesson fetch error:', error);
    return sendJson(res, 500, { error: error.message || 'Could not read lesson.' });
  }
}

async function handleCompleteLesson(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return sendJson(res, 200, {});
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });

  const slug = req.params?.slug;
  if (!slug) return sendJson(res, 400, { error: 'Lesson slug is required.' });

  try {
    if (!getBearerToken(req)) {
      return sendJson(res, 401, { error: 'Missing Authorization Bearer token.' });
    }

    const configError = getSupabaseConfigError();
    if (configError) return sendJson(res, 500, { error: configError });

    const auth = await getAuthenticatedUser(req);
    if (auth.error) return sendJson(res, 401, { error: auth.error });

    const { score = 100 } = await getJsonBody(req);
    const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));
    const admin = supabaseAdmin();
    let lessons = await readLessons(admin, { target_language: req.query?.language || 'english', level: 'A1' });
    const lesson = lessons.find((item) => item.slug === slug) || (await readLessons(admin, { slug }))[0];

    if (!lesson) return sendJson(res, 404, { error: 'Lesson not found.' });

    const { error: completionError } = await admin
      .from('lesson_completions')
      .upsert({
        user_id: auth.user.id,
        lesson_id: lesson.id,
        score: normalizedScore,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });

    if (completionError) {
      throw new Error(`Could not complete lesson: ${completionError.message}`);
    }

    const completedSlugs = await getCompletedSlugs(admin, auth.user.id);
    lessons = lessons.length ? lessons : await readLessons(admin, { level: lesson.level });
    const routeCompletedCount = lessons.filter((item) => completedSlugs.has(item.slug)).length;
    const progress = lessons.length ? Math.round((routeCompletedCount / lessons.length) * 100) : 0;
    const nextLesson = nextLessonTitle(lessons, completedSlugs);

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: auth.user.id,
        full_name: auth.user.user_metadata?.name || auth.user.email,
        email: auth.user.email,
        progress,
        streak: Math.max(1, (await getProfile(admin, auth.user.id))?.streak || 0),
        next_lesson: nextLesson
      }, { onConflict: 'id' })
      .select('progress, streak, next_lesson')
      .single();

    if (profileError) {
      throw new Error(`Could not update progress: ${profileError.message}`);
    }

    return sendJson(res, 200, {
      success: true,
      completedLesson: slug,
      progress: profile.progress ?? progress,
      streak: profile.streak ?? 1,
      nextLesson: profile.next_lesson || nextLesson
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    if (isLessonsTableError(error)) {
      return sendJson(res, 503, {
        error: error.message,
        manualAction: 'Run supabase/migrations/202601010001_andergo_lessons.sql in the Supabase SQL editor.'
      });
    }
    return sendJson(res, 500, { error: error.message || 'Could not complete lesson.' });
  }
}

module.exports = {
  handleHealth,
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleUser,
  handleProgress,
  handleLessons,
  handleLesson,
  handleCompleteLesson
};

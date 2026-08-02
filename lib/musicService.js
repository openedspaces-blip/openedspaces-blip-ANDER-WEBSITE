const { supabaseAdmin, getSupabaseConfigError } = require('./supabase');

function normalizeLyrics(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((line) => ({
      time: Number(line?.time),
      text: String(line?.text || '').trim()
    }))
    .filter((line) => Number.isFinite(line.time) && line.time >= 0 && line.text)
    .sort((a, b) => a.time - b.time);
}

async function listPublishedTracks() {
  const configError = getSupabaseConfigError();
  if (configError) throw new Error(configError);
  const client = supabaseAdmin();
  const { data, error } = await client
    .from('music_tracks')
    .select('id,title,artist,language,level,audio_path,cover_url,lyrics')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });
  // The frontend may be deployed just before the operator runs the migration.
  // Keep Music as a clean empty library during that short handoff instead of
  // exposing a database error to students.
  if (error?.code === '42P01' || error?.code === 'PGRST205') return [];
  if (error) throw error;

  return Promise.all(
    (data || []).map(async (track) => {
      const { data: signed, error: signedError } = await client.storage
        .from('music-audio')
        .createSignedUrl(track.audio_path, 3600);
      if (signedError) throw signedError;
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        language: track.language,
        level: track.level,
        coverUrl: track.cover_url || '',
        audioUrl: signed.signedUrl,
        lyrics: normalizeLyrics(track.lyrics)
      };
    })
  );
}

module.exports = { listPublishedTracks, normalizeLyrics };

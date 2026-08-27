// Server-side neural speech for on-demand Reading playback. Provider secrets
// stay server-only; the browser receives an MP3 stream and keeps device speech
// as its final fallback. ResponsiveVoice is selected client-side first for
// Premium learners; Gemini, ElevenLabs, and Azure are server-side options.
// A provider request accepts up to 4096 characters. A complete reading may
// be longer, so the server joins several safe sentence chunks while keeping
// a conservative request cap for cost and latency.
const MAX_PROVIDER_INPUT_CHARS = 3900;
const MAX_READING_CHARS = 12000;

const AZURE_SPEECH_KEY = String(process.env.AZURE_SPEECH_KEY || '').trim();
const AZURE_SPEECH_REGION = String(process.env.AZURE_SPEECH_REGION || '').trim();
const AZURE_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const ELEVENLABS_API_KEY = String(process.env.ELEVENLABS_API_KEY || '').trim();
const ELEVENLABS_FALLBACK_VOICE_ID = String(process.env.ELEVENLABS_VOICE_ID || '').trim();
const ELEVENLABS_MODEL_ID = String(process.env.ELEVENLABS_TTS_MODEL || 'eleven_multilingual_v2').trim();
const GEMINI_TTS_MODEL = String(process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts').trim();
const GEMINI_TTS_VOICE = String(process.env.GEMINI_TTS_VOICE || 'Kore').trim();
const GEMINI_TTS_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const ELEVENLABS_VOICE_IDS = {
  english: String(process.env.ELEVENLABS_VOICE_ID_EN || '').trim(),
  spanish: String(process.env.ELEVENLABS_VOICE_ID_ES || '').trim(),
  french: String(process.env.ELEVENLABS_VOICE_ID_FR || '').trim(),
  italian: String(process.env.ELEVENLABS_VOICE_ID_IT || '').trim(),
  german: String(process.env.ELEVENLABS_VOICE_ID_DE || '').trim(),
  portuguese: String(process.env.ELEVENLABS_VOICE_ID_PT || '').trim()
};
const AZURE_VOICES = {
  english: 'en-US-AvaMultilingualNeural',
  spanish: 'es-ES-ElviraNeural',
  french: 'fr-FR-DeniseNeural',
  german: 'de-DE-KatjaNeural',
  italian: 'it-IT-ElsaNeural',
  portuguese: 'pt-BR-FranciscaNeural'
};

function isAzureConfigured() {
  return Boolean(AZURE_SPEECH_KEY && AZURE_SPEECH_REGION);
}

function isElevenLabsConfigured() {
  return Boolean(ELEVENLABS_API_KEY && (ELEVENLABS_FALLBACK_VOICE_ID || Object.values(ELEVENLABS_VOICE_IDS).some(Boolean)));
}

function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && String(process.env.GEMINI_API_KEY).trim());
}

function resolveElevenLabsVoiceId(language = 'english') {
  return ELEVENLABS_VOICE_IDS[language] || ELEVENLABS_FALLBACK_VOICE_ID;
}

function isConfigured() {
  return isGeminiConfigured() || isElevenLabsConfigured() || isAzureConfigured();
}

function ttsProvider() {
  if (isGeminiConfigured()) return 'gemini';
  if (isElevenLabsConfigured()) return 'elevenlabs';
  if (isAzureConfigured()) return 'azure';
  return 'browser';
}

function voiceForLanguage(language = 'english') {
  if (isElevenLabsConfigured()) return resolveElevenLabsVoiceId(language);
  if (isAzureConfigured()) return AZURE_VOICES[language] || AZURE_VOICES.english;
  return GEMINI_TTS_VOICE;
}

function pcmToWav(pcm, { sampleRate = 24000, channels = 1, bitDepth = 16 } = {}) {
  const bytesPerSample = bitDepth / 8;
  const byteRate = sampleRate * channels * bytesPerSample;
  const blockAlign = channels * bytesPerSample;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function withAudioMetadata(audio, contentType) {
  Object.defineProperty(audio, 'contentType', { value: contentType, enumerable: false });
  return audio;
}

async function generateGeminiSpeech(text, { language = 'english' } = {}) {
  if (!isGeminiConfigured()) {
    const error = new Error('Gemini no está configurado.');
    error.status = 503;
    throw error;
  }
  const languageLabels = {
    english: 'English', spanish: 'Latin American Spanish', french: 'French',
    italian: 'Italian', german: 'German', portuguese: 'Brazilian Portuguese'
  };
  const delivery = language === 'spanish'
    ? 'Use a warm, expressive Latin American Spanish narration, with a natural Caribbean-friendly cadence suitable for a high-quality educational podcast. Keep the pronunciation clear and neutral across Latin America. Do not imitate an exaggerated accent.'
    : 'Use a warm, measured teaching pace and precise pronunciation.';
  const response = await fetch(
    `${GEMINI_TTS_API_BASE}/${encodeURIComponent(GEMINI_TTS_MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Read the following text naturally and clearly in ${languageLabels[language] || 'the requested language'} for a language learner. ${delivery} Do not add any words.\n\n${text}` }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } } }
        }
      })
    }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Gemini TTS respondió ${response.status}.`);
    error.status = response.status >= 400 && response.status < 500 ? 503 : 502;
    throw error;
  }
  const audioData = data?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData?.data;
  if (!audioData) {
    const error = new Error('Gemini no devolvió audio.');
    error.status = 502;
    throw error;
  }
  return withAudioMetadata(pcmToWav(Buffer.from(audioData, 'base64')), 'audio/wav');
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateAzureSpeech(text, { language = 'english' } = {}) {
  const voice = AZURE_VOICES[language] || AZURE_VOICES.english;
  const endpoint = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': AZURE_OUTPUT_FORMAT,
      'User-Agent': 'ANDERGO-Language-Academy'
    },
    body: `<speak version="1.0" xml:lang="${voice.slice(0, 5)}"><voice name="${voice}"><prosody rate="-6%">${escapeXml(text)}</prosody></voice></speak>`
  });
  if (!response.ok) {
    const error = new Error(`Azure Speech respondió ${response.status}.`);
    error.status = response.status >= 400 && response.status < 500 ? 503 : 502;
    throw error;
  }
  return Buffer.from(await response.arrayBuffer());
}

async function generateSpeechMp3ViaElevenLabs(text, { language = 'english' } = {}) {
  const voiceId = resolveElevenLabsVoiceId(language);
  if (!isElevenLabsConfigured() || !voiceId) {
    const error = new Error('ElevenLabs no está configurado.');
    error.status = 503;
    throw error;
  }
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
        output_format: 'mp3_44100_128',
        voice_settings: { stability: 0.48, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true }
      })
    }
  );
  if (!response.ok) {
    const error = new Error(`ElevenLabs respondió ${response.status}.`);
    error.status = response.status >= 400 && response.status < 500 ? 503 : 502;
    throw error;
  }
  return Buffer.from(await response.arrayBuffer());
}

function splitReadingIntoSpeechChunks(text) {
  const sentences = String(text || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const chunks = [];
  let current = '';
  sentences.forEach((sentence) => {
    const clean = sentence.trim();
    if (!clean) return;
    if (clean.length > MAX_PROVIDER_INPUT_CHARS) {
      if (current) chunks.push(current);
      for (let start = 0; start < clean.length; start += MAX_PROVIDER_INPUT_CHARS) {
        chunks.push(clean.slice(start, start + MAX_PROVIDER_INPUT_CHARS));
      }
      current = '';
      return;
    }
    if (`${current} ${clean}`.trim().length > MAX_PROVIDER_INPUT_CHARS) {
      if (current) chunks.push(current);
      current = clean;
    } else {
      current = `${current} ${clean}`.trim();
    }
  });
  if (current) chunks.push(current);
  return chunks;
}

async function generateReadingSpeech(text, { language = 'english', provider = '' } = {}) {
  if (!isConfigured()) {
    const error = new Error('La voz natural no está configurada.');
    error.status = 503;
    throw error;
  }
  const input = String(text || '').replace(/\s+/g, ' ').trim();
  if (!input || input.length > MAX_READING_CHARS) {
    const error = new Error('El texto no está disponible para voz natural.');
    error.status = 400;
    throw error;
  }
  if (provider !== 'elevenlabs' && isGeminiConfigured()) {
    try {
      return await generateGeminiSpeech(input, { language });
    } catch (error) {
      // A malformed or unavailable Gemini credential must not make the
      // Premium voice unusable when another configured provider can respond.
      console.warn(`[ttsService] Gemini TTS unavailable; using configured fallback: ${error.message}`);
    }
  }
  const chunks = splitReadingIntoSpeechChunks(input);
  if (isElevenLabsConfigured()) {
    const audioParts = [];
    for (const chunk of chunks) audioParts.push(await generateSpeechMp3ViaElevenLabs(chunk, { language }));
    return withAudioMetadata(Buffer.concat(audioParts), 'audio/mpeg');
  }
  if (isAzureConfigured()) {
    const audioParts = [];
    for (const chunk of chunks) audioParts.push(await generateAzureSpeech(chunk, { language }));
    return withAudioMetadata(Buffer.concat(audioParts), 'audio/mpeg');
  }
  const error = new Error('La voz natural no está configurada.');
  error.status = 503;
  throw error;
}

// Legacy exports keep maintenance scripts loadable. Live Reading uses the
// function above; generated catalog audio is intentionally not automatic.
async function generateSpeechMp3(text, options) { return generateReadingSpeech(text, options); }
async function generateDialogueMp3() { throw new Error('Diálogos TTS no están configurados.'); }
async function generateTutorSpeech() { return null; }
module.exports = {
  generateSpeechMp3, generateTutorSpeech, generateReadingSpeech, isConfigured,
  voiceForLanguage, ttsProvider, isElevenLabsConfigured, resolveElevenLabsVoiceId,
  generateSpeechMp3ViaElevenLabs, generateDialogueMp3, MAX_READING_CHARS,
  isAzureConfigured, isGeminiConfigured
};

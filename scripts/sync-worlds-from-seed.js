const fs = require('node:fs');
const path = require('node:path');
const { getLocalLessons } = require('../lib/lessonsData');
const { levelContentByLanguage } = require('../lib/worldSeed');

const root = path.resolve(__dirname, '..');

function writeWorld(language) {
  const worldDir = path.join(root, 'worlds', language);
  fs.mkdirSync(worldDir, { recursive: true });

  const content = `(() => {\n  window.ANDERGO_LANGUAGE_WORLDS = window.ANDERGO_LANGUAGE_WORLDS || { lessons: {}, levelContent: {} };\n  window.ANDERGO_LANGUAGE_WORLDS.lessons = window.ANDERGO_LANGUAGE_WORLDS.lessons || {};\n  window.ANDERGO_LANGUAGE_WORLDS.levelContent = window.ANDERGO_LANGUAGE_WORLDS.levelContent || {};\n  window.ANDERGO_LANGUAGE_WORLDS.lessons.${language} = ${JSON.stringify(getLocalLessons(language), null, 2)};\n  window.ANDERGO_LANGUAGE_WORLDS.levelContent.${language} = ${JSON.stringify(levelContentByLanguage[language], null, 2)};\n})();\n`;

  fs.writeFileSync(path.join(worldDir, 'content.js'), content);
}

['english', 'french', 'spanish', 'italian', 'german'].forEach(writeWorld);
console.log('Generated browser world files.');

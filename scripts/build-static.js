const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const publicDir = path.join(root, 'public');

function ensureCleanDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  fs.mkdirSync(directoryPath, { recursive: true });
}

function copyToPublic(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

ensureCleanDirectory(publicDir);
['index.html', 'script.js', 'styles.css', 'gamification.js', 'worlds'].forEach(copyToPublic);
console.log('Built static assets into public/');

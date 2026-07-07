const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');

const filesToCopy = [
  'index.html',
  'styles.css',
  'script.js',
  'andergo-logo.png'
];

const foldersToCopy = [
  'worlds'
];

function copyFileIfExists(source, destination) {
  if (!fs.existsSync(source)) {
    console.warn(`Skipped missing file: ${path.relative(root, source)}`);
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  console.log(`Copied file: ${path.relative(root, source)} -> ${path.relative(root, destination)}`);
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) {
    console.warn(`Skipped missing folder: ${path.relative(root, source)}`);
    return;
  }

  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      copyFileIfExists(sourcePath, destinationPath);
    }
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of filesToCopy) {
  copyFileIfExists(path.join(root, file), path.join(output, file));
}

for (const folder of foldersToCopy) {
  copyDirectory(path.join(root, folder), path.join(output, folder));
}

console.log(`Static site copied to ${path.relative(root, output)}`);
console.log('Included folders:', foldersToCopy.join(', '));

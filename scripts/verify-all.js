const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', 'public']);

function collectJsFiles(directoryPath, results = []) {
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        collectJsFiles(path.join(directoryPath, entry.name), results);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(path.join(directoryPath, entry.name));
    }
  }

  return results;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

for (const filePath of collectJsFiles(root)) {
  run(process.execPath, ['--check', filePath]);
}

run('npm', ['test']);

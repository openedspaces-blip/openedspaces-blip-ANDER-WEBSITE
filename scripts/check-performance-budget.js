const fs = require('fs');
const path = require('path');

const budgets = [
  ['src/js/script.js', 800_000],
  ['src/css/styles.css', 330_000],
  ['src/js/verbs/verbs-view.js', 100_000]
];

let failed = false;
for (const [relativePath, maximumBytes] of budgets) {
  const bytes = fs.statSync(path.join(__dirname, '..', relativePath)).size;
  const status = bytes <= maximumBytes ? 'PASS' : 'FAIL';
  console.log(`${status} ${relativePath}: ${bytes} / ${maximumBytes} bytes`);
  if (bytes > maximumBytes) failed = true;
}

if (failed) {
  console.error('El frontend excede el presupuesto de rendimiento.');
  process.exitCode = 1;
}

const fs = require('fs');
const { execSync } = require('child_process');

const FILES = [
  'scripts/content/french-b1-units.js',
  'scripts/content/french-b2-units.js',
  'scripts/content/french-c1-advanced-units.js',
  'scripts/content/french-c1-units.js'
];
const OLD_REF = 'a9d5448';

// Extracts, for each unit slug in `text`, the substring of its
// `listening: activity('listening', { ... }),` block using brace-depth
// matching (safe against nested braces in prompts/options).
function extractListeningBlocks(text) {
  const blocks = new Map();
  const slugRe = /slug:\s*'([^']+)'/g;
  let slugMatch;
  const slugPositions = [];
  while ((slugMatch = slugRe.exec(text))) {
    slugPositions.push({ slug: slugMatch[1], index: slugMatch.index });
  }
  for (let i = 0; i < slugPositions.length; i += 1) {
    const start = slugPositions[i].index;
    const end = i + 1 < slugPositions.length ? slugPositions[i + 1].index : text.length;
    const unitText = text.slice(start, end);
    const marker = "listening: activity('listening', {";
    const markerIdx = unitText.indexOf(marker);
    if (markerIdx === -1) continue;
    // Find the matching close: walk from the '{' right after activity('listening',
    const openBraceIdx = unitText.indexOf('{', markerIdx + marker.length - 1);
    let depth = 0;
    let j = openBraceIdx;
    for (; j < unitText.length; j += 1) {
      if (unitText[j] === '{') depth += 1;
      else if (unitText[j] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    // unitText[markerIdx .. j+3] covers `listening: activity('listening', { ... })` + trailing `,`
    // j is at the closing '}' of the options object; activity(...) call closes with '),' right after.
    let end2 = j + 1;
    while (end2 < unitText.length && /[)\s]/.test(unitText[end2])) end2 += 1;
    if (unitText[end2 - 1] !== ',') {
      // ensure we include the trailing comma if present right after
      if (unitText[end2] === ',') end2 += 1;
    }
    const block = unitText.slice(markerIdx, end2);
    blocks.set(slugPositions[i].slug, block);
  }
  return blocks;
}

for (const file of FILES) {
  const current = fs.readFileSync(file, 'utf8');
  const old = execSync(`git show ${OLD_REF}:${file}`, { encoding: 'utf8' });
  const currentBlocks = extractListeningBlocks(current);
  const oldBlocks = extractListeningBlocks(old);
  let patched = current;
  let replaced = 0;
  let skipped = [];
  for (const [slug, currentBlock] of currentBlocks) {
    const oldBlock = oldBlocks.get(slug);
    if (!oldBlock) { skipped.push(slug + ' (no old block)'); continue; }
    if (!patched.includes(currentBlock)) { skipped.push(slug + ' (current block not found verbatim)'); continue; }
    patched = patched.replace(currentBlock, oldBlock);
    replaced += 1;
  }
  fs.writeFileSync(file, patched, 'utf8');
  console.log(`${file}: replaced ${replaced}/${currentBlocks.size} listening blocks. Skipped: ${skipped.join('; ') || 'none'}`);
}

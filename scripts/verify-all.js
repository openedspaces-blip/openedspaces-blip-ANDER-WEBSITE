const http = require('http');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL || 'http://localhost:3000';
const PRODUCTION_BASE_URL = process.env.PRODUCTION_BASE_URL || 'https://andergo.online';

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { shell: process.platform === 'win32', stdio: 'pipe' });
    let output = '';

    child.stdout.on('data', (chunk) => {
      output += chunk;
    });

    child.stderr.on('data', (chunk) => {
      output += chunk;
    });

    child.on('error', (error) => {
      resolve({ code: 1, output: error.message });
    });

    child.on('close', (code) => {
      resolve({ code, output: output.trim() });
    });
  });
}

function startServer() {
  const child = spawn('node', ['lib/server.js'], { shell: process.platform === 'win32', stdio: 'pipe' });
  let output = '';

  child.stdout.on('data', (chunk) => {
    output += chunk;
  });

  child.stderr.on('data', (chunk) => {
    output += chunk;
  });

  return { child, getOutput: () => output.trim() };
}

async function waitForHealth(url, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    const result = await requestJson(url);
    if (result.status) return result;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return requestJson(url);
}

function requestJson(url) {
  return new Promise((resolve) => {
    const transport = url.startsWith('https:') ? https : http;

    const req = transport.get(url, { timeout: 15000 }, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        let parsed = null;

        try {
          parsed = JSON.parse(body);
        } catch {}

        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          body,
          parsed
        });
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (error) => {
      resolve({ ok: false, error: error.message });
    });
  });
}

function printResult(name, passed, details) {
  const marker = passed ? 'PASS' : 'FAIL';
  console.log(`[${marker}] ${name}`);

  if (details) {
    console.log(details);
  }

  console.log('');
}

(async () => {
  let failures = 0;

  const tests = await run('npm', ['test']);
  const testsPassed = tests.code === 0;
  if (!testsPassed) failures += 1;
  printResult('Unit tests', testsPassed, tests.output);

  const build = await run('npm', ['run', 'build']);
  const buildPassed = build.code === 0;
  if (!buildPassed) failures += 1;
  printResult('Build command', buildPassed, build.output);

  const hasSupabaseTest = fs.existsSync('test-supabase.js');
  if (hasSupabaseTest) {
    const supabase = await run('node', ['test-supabase.js']);
    const supabasePassed = supabase.code === 0;
    if (!supabasePassed) failures += 1;
    printResult('Supabase configuration and profiles table', supabasePassed, supabase.output);
  } else {
    printResult('Supabase configuration and profiles table', true, 'Skipped: test-supabase.js was not found.');
  }

  const server = startServer();

  try {
    const localHealth = await waitForHealth(`${LOCAL_BASE_URL}/api/health`);
    const localPassed = localHealth.parsed?.ok === true && localHealth.parsed?.configured === true;

    if (!localPassed) failures += 1;
    printResult('Local /api/health', localPassed, JSON.stringify(localHealth.parsed || localHealth, null, 2));
  } finally {
    server.child.kill();
  }

  const productionHealth = await requestJson(`${PRODUCTION_BASE_URL}/api/health`);
  const productionPassed = productionHealth.parsed?.ok === true && productionHealth.parsed?.configured === true;

  if (!productionPassed) failures += 1;
  printResult('Production /api/health', productionPassed, JSON.stringify(productionHealth.parsed || productionHealth, null, 2));

  if (failures > 0) {
    console.log(`${failures} verification step(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log('All verification steps passed.');
})();

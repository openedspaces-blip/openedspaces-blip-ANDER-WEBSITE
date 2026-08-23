#!/usr/bin/env node
/**
 * Notify IndexNow after a meaningful public content release.
 *
 * Run manually after a production deployment:
 *   npm run submit:indexnow
 *
 * The verification key is intentionally public: IndexNow verifies ownership
 * by fetching the matching text file at the root of andergo.online.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOST = 'andergo.online';
const KEY = '830147164463cf68f149cb4e21cfc9fd';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function getCanonicalUrls() {
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
  const validUrls = [...new Set(urls)].filter((url) => {
    try {
      return new URL(url).host === HOST;
    } catch {
      return false;
    }
  });

  if (!validUrls.length) throw new Error('No canonical ANDERGO URLs were found in sitemap.xml.');
  if (validUrls.length > 10_000) throw new Error('IndexNow accepts at most 10,000 URLs per batch.');
  return validUrls;
}

async function submit() {
  const urlList = getCanonicalUrls();
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList })
  });
  const responseText = await response.text();

  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow rejected the submission (${response.status}): ${responseText || 'no response body'}`);
  }

  console.log(`IndexNow accepted ${urlList.length} canonical URLs (HTTP ${response.status}).`);
}

submit().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

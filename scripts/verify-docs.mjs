#!/usr/bin/env node
// PHASE 01 documentation verifier.
// - No dependencies (Node >= 18). Read-only: never modifies files.
// - Verifies STRUCTURE (files, mandatory sections, 24 phases, rule IDs, ADRs,
//   policies, links, obvious secret patterns). It does NOT prove content quality.
// Usage: node scripts/verify-docs.mjs

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIN_CHARS = 400;
const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const FILES = [
  'README.md',
  'PROJECT_CONTEXT.md',
  'DEVELOPMENT_PROGRESS.md',
  'docs/AGENT_RULES.md',
  'docs/DECISIONS.md',
  'docs/PRODUCT_POLICIES.md',
  'docs/GLOSSARY.md',
  'docs/ASSET_LICENSES.md',
  'docs/THREAT_MODEL.md',
];

// ---------- helpers ----------
function parseSections(text) {
  const sections = [];
  let inFence = false;
  let current = null;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      if (current) current.body.push(line);
      continue;
    }
    const m = inFence ? null : line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      current = { level: m[1].length, title: m[2], body: [] };
      sections.push(current);
      continue;
    }
    if (current) current.body.push(line);
  }
  return sections;
}

const docs = {};
for (const rel of FILES) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) {
    fail(`MISSING FILE: ${rel}`);
    continue;
  }
  const text = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  const sections = parseSections(text);
  docs[rel] = { text, sections };
  if (text.trim().length < MIN_CHARS) fail(`TOO SHORT (<${MIN_CHARS} chars): ${rel}`);
  if (sections.length === 0) fail(`NO HEADINGS: ${rel}`);
  for (const s of sections) {
    if (s.body.join('').trim() === '') fail(`EMPTY HEADING in ${rel}: "${s.title}"`);
  }
}

function needHeadings(rel, needles) {
  const d = docs[rel];
  if (!d) return;
  for (const n of needles) {
    if (!d.sections.some((s) => s.title.includes(n))) {
      fail(`MISSING SECTION in ${rel}: "${n}"`);
    }
  }
}

function needTokens(rel, tokens) {
  const d = docs[rel];
  if (!d) return;
  for (const t of tokens) {
    if (!d.text.includes(t)) fail(`MISSING TOKEN in ${rel}: "${t}"`);
  }
}

// ---------- AGENT_RULES ----------
{
  const rel = 'docs/AGENT_RULES.md';
  needHeadings(rel, ['HRD', 'القواعد الـ22', 'حلقة العمل', 'التقرير']);
  const ids = [];
  for (let i = 1; i <= 9; i++) ids.push(`HRD-${i}:`);
  for (let i = 1; i <= 22; i++) ids.push(`R-${String(i).padStart(2, '0')}`);
  needTokens(rel, ids);
  needTokens(rel, ['اقرأ', 'خطط', 'نفذ', 'اختبر', 'حدّث', 'صادق']);
}

// ---------- PROJECT_CONTEXT ----------
{
  const rel = 'PROJECT_CONTEXT.md';
  needHeadings(rel, [
    'القرارات التقنية',
    'إصدارات الأدوات',
    'بنية المجلدات',
    'الوظائف المكتملة',
    'الوظائف غير المكتملة',
    'الخدمات المتصلة',
    'الخدمات التجريبية',
    'المشكلات المعروفة',
    'الخطوة التالية',
  ]);
  needTokens(rel, [
    'guest', 'member', 'applicant', 'donor', 'partner_owner', 'ambassador',
    'volunteer', 'reviewer', 'moderator', 'partner_verifier', 'finance_officer',
    'content_editor', 'admin', 'auditor',
    '#09080F', '#7136C9', '#9B5CFF', '#D9A928', '#F0CA68',
  ]);
}

// ---------- DEVELOPMENT_PROGRESS ----------
{
  const rel = 'DEVELOPMENT_PROGRESS.md';
  const d = docs[rel];
  if (d) {
    const allowed = new Set(['Not Started', 'In Progress', 'Done']);
    const rows = d.text.split('\n').filter((l) => /^\|\s*P\d{2}\s*\|/.test(l));
    const seen = new Set();
    for (const row of rows) {
      const c = row.split('|').map((x) => x.trim());
      const id = c[1];
      const status = c[3];
      const date = c[4] ?? '';
      seen.add(id);
      if (!allowed.has(status)) fail(`BAD STATUS in ${rel} for ${id}: "${status}"`);
      if (status === 'Done' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        warn(`${id} is Done but date is not YYYY-MM-DD (fill it at merge time)`);
      }
    }
    for (let i = 1; i <= 24; i++) {
      const id = `P${String(i).padStart(2, '0')}`;
      if (!seen.has(id)) fail(`MISSING PHASE ROW in ${rel}: ${id}`);
    }
    if (seen.size !== 24) fail(`EXPECTED 24 phase rows in ${rel}, found ${seen.size}`);
    const p01 = rows.find((r) => /^\|\s*P01\s*\|/.test(r));
    if (p01 && p01.split('|').map((x) => x.trim())[3] !== 'Done') {
      fail('P01 must be "Done" (completion condition)');
    }
  }
}

// ---------- DECISIONS ----------
{
  const rel = 'docs/DECISIONS.md';
  const d = docs[rel];
  if (d) {
    const adrs = d.sections.filter((s) => s.level === 2 && /^ADR-\d{4}/.test(s.title));
    if (adrs.length < 7) fail(`EXPECTED >= 7 ADR sections in ${rel}, found ${adrs.length}`);
    for (const a of adrs) {
      const body = a.body.join('\n');
      for (const f of ['الحالة', 'السياق', 'القرار', 'البدائل', 'العواقب']) {
        if (!body.includes(f)) fail(`ADR "${a.title}" missing field: ${f}`);
      }
    }
    const wanted = [
      ['ADR-0001', 'npm'],
      ['ADR-0002', 'Zustand'],
      ['ADR-0003', '3D'],
      ['ADR-0004', 'Playwright'],
      ['ADR-0005', 'Non-Custodial'],
      ['ADR-0006', 'Advisory'],
    ];
    for (const [id, kw] of wanted) {
      if (!adrs.some((a) => a.title.startsWith(id) && a.title.includes(kw))) {
        fail(`MISSING/MISMATCHED ${id} (${kw}) in ${rel}`);
      }
    }
    needHeadings(rel, ['قالب ADR']);
  }
}

// ---------- PRODUCT_POLICIES ----------
{
  const rel = 'docs/PRODUCT_POLICIES.md';
  const d = docs[rel];
  if (d) {
    const pols = d.sections.filter((s) => s.level === 2 && /^POL-\d{2}/.test(s.title));
    if (pols.length !== 8) fail(`EXPECTED 8 POL sections in ${rel}, found ${pols.length}`);
    for (const p of pols) {
      const body = p.body.join('\n');
      if (!body.includes('القيمة الحالية = (قيمة افتراضية مؤقتة)')) {
        fail(`POLICY "${p.title}" missing "القيمة الحالية = (قيمة افتراضية مؤقتة)"`);
      }
      if (!body.includes('الحالة = بانتظار قرار بشري')) {
        fail(`POLICY "${p.title}" missing "الحالة = بانتظار قرار بشري"`);
      }
    }
  }
}

// ---------- GLOSSARY ----------
{
  const rel = 'docs/GLOSSARY.md';
  const d = docs[rel];
  if (d) {
    const tableRows = d.text.split('\n').filter((l) => /^\|/.test(l));
    if (tableRows.length < 40) fail(`GLOSSARY too small: ${tableRows.length} table lines (<40)`);
    needTokens(rel, ['Non-Custodial', 'Advisory', 'RTL', 'Qamariya', 'dataOrigin']);
  }
}

// ---------- ASSET_LICENSES ----------
needHeadings('docs/ASSET_LICENSES.md', ['قواعد', 'سجل الأصول']);

// ---------- THREAT_MODEL ----------
{
  const rel = 'docs/THREAT_MODEL.md';
  needHeadings(rel, ['الأصول', 'المهاجمون', 'أسطح الهجوم', 'STRIDE', 'الضوابط']);
  needTokens(rel, [
    'Spoofing', 'Tampering', 'Repudiation',
    'Information Disclosure', 'Denial of Service', 'Elevation of Privilege',
  ]);
}

// ---------- README ----------
needTokens('README.md', ['AZIB', 'عازب', 'P01']);

// ---------- relative links ----------
for (const [rel, d] of Object.entries(docs)) {
  const re = /\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(d.text)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const clean = target.split('#')[0];
    if (!clean) continue;
    const abs = resolve(ROOT, dirname(rel), clean);
    if (!existsSync(abs)) fail(`BROKEN LINK in ${rel}: ${target}`);
  }
}

// ---------- obvious secret / card patterns ----------
const SECRET_PATTERNS = [
  [/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, 'JWT-like token'],
  [/sk_(live|test)_[A-Za-z0-9]{10,}/, 'payment secret key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/\b\d{13,19}\b/, 'long digit run (possible card number)'],
];
for (const [rel, d] of Object.entries(docs)) {
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(d.text)) fail(`POSSIBLE SECRET in ${rel}: ${label}`);
  }
}

// ---------- report ----------
console.log('AZIB P01 documentation check');
console.log(`Files checked: ${Object.keys(docs).length}/${FILES.length}`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
if (errors.length > 0) {
  console.log(`\nResult: FAILED (${errors.length} error(s), ${warnings.length} warning(s))`);
  process.exit(1);
}
console.log(`\nResult: structural checks passed (${warnings.length} warning(s)).`);
console.log('Note: this verifies structure only, not content quality or human sign-off.');

#!/usr/bin/env node
/**
 * check-dead-buttons.mjs
 *
 * Fails when app/ or src/features/ contains:
 *   1) Empty interactive handlers: onPress={() => {}}, onAction={() => null},
 *      onChange={noop}, function () {} ... (any on* JSX prop).
 *   2) Unfinished markers: TODO or FIXME anywhere in scanned files.
 *
 * Scope (project decision): app/ and src/features/ only.
 * Exclusions:
 *   - app/(dev)/gallery.tsx  → intentional Design System showcase (noop demos).
 *   - __tests__ directories  → test fixtures are not shipped UI.
 *
 * Every real button must do real work, navigate, or open an honest
 * Not Connected state. Disabled controls must use the disabled prop.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['app', 'src/features'];
const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'web-build',
  'build',
  'coverage',
  '__tests__',
]);
const ALLOW_PATHS = new Set(['app/(dev)/gallery.tsx']);

// Empty arrow/function handlers passed to any on* prop.
const EMPTY_HANDLER_RE =
  /\bon[A-Z][A-Za-z0-9_]*\s*=\s*\{\s*(?:(?:async\s+)?\([^)]*\)\s*=>\s*(?:\{\s*\}|null|undefined)|function\s*\([^)]*\)\s*\{\s*\}|noop)\s*\}/g;
const TODO_RE = /\b(?:TODO|FIXME)\b/;

const findings = [];

function scanContent(rel, content) {
  EMPTY_HANDLER_RE.lastIndex = 0;
  let match;
  while ((match = EMPTY_HANDLER_RE.exec(content)) !== null) {
    const line = content.slice(0, match.index).split('\n').length;
    findings.push({
      rel,
      line,
      kind: 'empty-handler',
      text: match[0].replace(/\s+/g, ' ').slice(0, 120),
    });
  }
  content.split('\n').forEach((lineText, idx) => {
    if (TODO_RE.test(lineText)) {
      findings.push({
        rel,
        line: idx + 1,
        kind: 'todo-marker',
        text: lineText.trim().slice(0, 120),
      });
    }
  });
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // Missing scan root is fine (e.g. fixture with only one root).
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      await walk(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = relative(ROOT, fullPath).split('\\').join('/');
    if (ALLOW_PATHS.has(rel)) continue;
    const ext = extname(fullPath);
    if (ext !== '.ts' && ext !== '.tsx') continue;
    const content = await readFile(fullPath, 'utf8');
    scanContent(rel, content);
  }
}

for (const root of SCAN_ROOTS) {
  await walk(join(ROOT, root));
}

if (findings.length > 0) {
  console.error('✗ Dead buttons or unfinished markers detected:\n');
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line} [${f.kind}]: ${f.text}`);
  }
  console.error(`\nFound ${findings.length} occurrence(s) in app/ or src/features/.`);
  console.error('Every button must do real work, navigate, or open an honest Not Connected state.');
  console.error('Use the disabled prop (with a reason) instead of empty handlers.');
  process.exit(1);
}

console.log('✓ No dead buttons or unfinished markers found in app/ or src/features/.');

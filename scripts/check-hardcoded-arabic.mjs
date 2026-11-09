#!/usr/bin/env node
/**
 * check-hardcoded-arabic.mjs
 *
 * يفشل إن وُجدت أحرف عربية داخل أي ملف .ts أو .tsx خارج src/locales.
 * القاعدة (AGENT_RULES.md §1 #10): كل النصوص من src/locales/*.json عبر i18n.
 *
 * الاستثناء الوحيد المسموح: سطر واحد يحمل العلامة:
 *   i18n-allow-arabic
 * ويُستخدم فقط لمحتوى غير-UI (مثل fixture في اختبار). ممنوع لنصوص الواجهة.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['app', 'src'];
const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'web-build',
  'build',
  'coverage',
]);
const ALLOW_PATH_PREFIXES = [
  'src/locales/', // المكان الوحيد المسموح فيه بالنصوص العربية
];
const INLINE_ALLOW = 'i18n-allow-arabic';

// Arabic blocks:
//   0600–06FF  Arabic
//   0750–077F  Arabic Supplement
//   08A0–08FF  Arabic Extended-A
//   FB50–FDFF  Arabic Presentation Forms-A
//   FE70–FEFF  Arabic Presentation Forms-B
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const findings = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // المجلد غير موجود — لا مشكلة
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
    if (ALLOW_PATH_PREFIXES.some((prefix) => rel.startsWith(prefix))) continue;
    const ext = extname(fullPath);
    if (ext !== '.ts' && ext !== '.tsx') continue;
    const content = await readFile(fullPath, 'utf8');
    const lines = content.split('\n');
    let inBlockComment = false; // متغير لتتبع التعليقات الكتلية متعددة الأسطر

    lines.forEach((line, idx) => {
      if (line.includes(INLINE_ALLOW)) return;

      let codeToCheck = line;

      // 1. التعامل مع التعليقات الكتلية (/* ... */)
      if (inBlockComment) {
        const endIdx = codeToCheck.indexOf('*/');
        if (endIdx !== -1) {
          codeToCheck = codeToCheck.slice(endIdx + 2); // احتفظ بما بعد إغلاق التعليق
          inBlockComment = false;
        } else {
          return; // السطر بالكامل تعليق، تجاهله
        }
      }

      const startIdx = codeToCheck.indexOf('/*');
      if (startIdx !== -1) {
        const endIdx = codeToCheck.indexOf('*/', startIdx + 2);
        if (endIdx !== -1) {
          // التعليق يبدأ وينتهي في نفس السطر
          codeToCheck = codeToCheck.slice(0, startIdx) + codeToCheck.slice(endIdx + 2);
        } else {
          // التعليق يبدأ هنا ويستمر للأسطر التالية
          codeToCheck = codeToCheck.slice(0, startIdx);
          inBlockComment = true;
        }
      }

      // 2. التعامل مع تعليقات السطر الواحد (//)
      const lineCommentIdx = codeToCheck.indexOf('//');
      if (lineCommentIdx !== -1) {
        codeToCheck = codeToCheck.slice(0, lineCommentIdx);
      }

      // 3. الفحص النهائي (نفحص النص الخالي من التعليقات فقط)
      if (ARABIC_RE.test(codeToCheck)) {
        findings.push({ rel, line: idx + 1, text: line.trim().slice(0, 160) });
      }
    });
  }
}

for (const root of SCAN_ROOTS) {
  await walk(join(ROOT, root));
}

if (findings.length > 0) {
  console.error('✗ Hardcoded Arabic detected in non-locale TypeScript files:\n');
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}: ${f.text}`);
  }
  console.error(`\nFound ${findings.length} occurrence(s).`);
  console.error('Move these strings to src/locales/*.json and reference them via i18n keys.');
  console.error(`If a line is legitimately not UI (e.g. a test fixture), append the marker: ${INLINE_ALLOW}`);
  process.exit(1);
}

console.log('✓ No hardcoded Arabic found outside src/locales.');

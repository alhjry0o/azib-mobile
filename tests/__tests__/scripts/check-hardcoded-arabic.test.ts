import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(process.cwd(), 'scripts', 'check-hardcoded-arabic.mjs');

function runScript(cwd: string) {
  return spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });
}

describe('scripts/check-hardcoded-arabic.mjs', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'azib-arabic-check-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('passes when there is no Arabic in src', () => {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'ok.ts'), 'export const x = 1;\n');
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });

  it('fails when Arabic appears in src', () => {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'bad.ts'), 'export const x = "مرحبا";\n');
    const result = runScript(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Hardcoded Arabic/);
  });

  it('ignores files under src/locales', () => {
    mkdirSync(join(dir, 'src', 'locales'), { recursive: true });
    writeFileSync(join(dir, 'src', 'locales', 'sample.ts'), 'export const y = "مرحبا";\n');
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });

  it('allows the i18n-allow-arabic marker', () => {
    mkdirSync(join(dir, 'src'));
    writeFileSync(
      join(dir, 'src', 'with-marker.ts'),
      'export const x = "مرحبا"; // i18n-allow-arabic fixture\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });
});

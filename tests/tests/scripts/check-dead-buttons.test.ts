import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(process.cwd(), 'scripts', 'check-dead-buttons.mjs');

function runScript(cwd: string) {
  return spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });
}

describe('scripts/check-dead-buttons.mjs', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'azib-dead-buttons-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('passes on clean app and feature files', () => {
    mkdirSync(join(dir, 'app'), { recursive: true });
    mkdirSync(join(dir, 'src', 'features'), { recursive: true });
    writeFileSync(
      join(dir, 'app', 'ok.tsx'),
      'export const X = () => <Button onPress={() => doWork()} />;\n',
    );
    writeFileSync(join(dir, 'src', 'features', 'ok.ts'), 'export const value = 1;\n');
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });

  it('fails on an empty onPress arrow handler', () => {
    mkdirSync(join(dir, 'app'), { recursive: true });
    writeFileSync(
      join(dir, 'app', 'bad.tsx'),
      'export const X = () => <Button onPress={() => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/empty-handler/);
  });

  it('fails on empty async and parameterized handlers', () => {
    mkdirSync(join(dir, 'src', 'features'), { recursive: true });
    writeFileSync(
      join(dir, 'src', 'features', 'bad.tsx'),
      'export const X = () => <Button onPress={async (_e) => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/empty-handler/);
  });

  it('fails on onPress returning null', () => {
    mkdirSync(join(dir, 'app'), { recursive: true });
    writeFileSync(
      join(dir, 'app', 'null.tsx'),
      'export const X = () => <Button onPress={() => null} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(1);
  });

  it('fails on empty onAction handlers', () => {
    mkdirSync(join(dir, 'src', 'features'), { recursive: true });
    writeFileSync(
      join(dir, 'src', 'features', 'action.tsx'),
      'export const X = () => <Banner onAction={() => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/empty-handler/);
  });

  it('fails on TODO and FIXME markers', () => {
    mkdirSync(join(dir, 'src', 'features'), { recursive: true });
    writeFileSync(join(dir, 'src', 'features', 'todo.ts'), '// TODO: wire this later\n');
    const result = runScript(dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/todo-marker/);
  });

  it('ignores the Design System gallery (intentional showcase noops)', () => {
    mkdirSync(join(dir, 'app', '(dev)'), { recursive: true });
    writeFileSync(
      join(dir, 'app', '(dev)', 'gallery.tsx'),
      'export const X = () => <Button onPress={() => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });

  it('ignores __tests__ directories', () => {
    mkdirSync(join(dir, 'src', 'features', '__tests__'), { recursive: true });
    writeFileSync(
      join(dir, 'src', 'features', '__tests__', 'fixture.tsx'),
      'export const X = () => <Button onPress={() => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });

  it('does not scan outside app/ and src/features/', () => {
    mkdirSync(join(dir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(dir, 'src', 'components', 'outside.tsx'),
      'export const X = () => <Button onPress={() => {}} />;\n',
    );
    const result = runScript(dir);
    expect(result.status).toBe(0);
  });
});

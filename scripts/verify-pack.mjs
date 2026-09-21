import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const workspace = mkdtempSync(join(tmpdir(), 'cspa-pack-'));
const outputDir = process.env.CSPA_PACK_OUTPUT_DIR ? resolve(process.env.CSPA_PACK_OUTPUT_DIR) : workspace;
mkdirSync(outputDir, { recursive: true });

try {
  const packJson = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', outputDir], {
      encoding: 'utf8',
    }),
  );
  const tarball = join(outputDir, packJson[0].filename);

  const extractDir = join(workspace, 'package');
  execFileSync('tar', ['-xzf', tarball, '-C', workspace]);

  const required = [
    'package/dist/index.js',
    'package/dist/index.cjs',
    'package/dist/csp-safe-alert.global.js',
    'package/dist/csp-safe-alert.css',
    'package/dist/index.d.ts',
    'package/README.md',
    'package/LICENSE',
  ];

  for (const relative of required) {
    const path = join(workspace, relative);
    readFileSync(path);
  }

  const consumer = join(workspace, 'consumer');
  mkdirSync(consumer, { recursive: true });
  execFileSync('npm', ['init', '-y'], { cwd: consumer, stdio: 'ignore' });
  execFileSync('npm', ['install', tarball, '--ignore-scripts'], { cwd: consumer, stdio: 'inherit' });

  const esmSmoke = [
    "import { CspAlert, fire, mixin, queue } from 'csp-safe-alert';",
    "if (typeof CspAlert.fire !== 'function' || typeof fire !== 'function' || typeof mixin !== 'function' || typeof queue !== 'function') process.exit(1);",
  ].join('\n');
  writeFileSync(join(consumer, 'esm-smoke.mjs'), esmSmoke);
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumer, stdio: 'inherit' });

  const cjsSmoke = [
    "const pkg = require('csp-safe-alert');",
    "if (typeof pkg.CspAlert?.fire !== 'function' || typeof pkg.mixin !== 'function' || typeof pkg.queue !== 'function') process.exit(1);",
  ].join('\n');
  writeFileSync(join(consumer, 'cjs-smoke.cjs'), cjsSmoke);
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumer, stdio: 'inherit' });

  const globalBundle = readFileSync(join(extractDir, 'dist/csp-safe-alert.global.js'), 'utf8');
  if (/\beval\s*\(|\bnew\s+Function\s*\(|\.style\s*\./.test(globalBundle)) {
    throw new Error('Packed global bundle contains a forbidden runtime evaluation/style mutation pattern');
  }

  let npmLatest = null;
  let npm110Published = false;
  try {
    npmLatest = JSON.parse(execFileSync('npm', ['view', 'csp-safe-alert', 'version', '--json'], { encoding: 'utf8' }));
  } catch {
    npmLatest = null;
  }
  try {
    const published = execFileSync('npm', ['view', 'csp-safe-alert@1.1.0', 'version', '--json'], { encoding: 'utf8' }).trim();
    npm110Published = JSON.parse(published) === '1.1.0';
  } catch {
    npm110Published = false;
  }

  console.log(JSON.stringify({
    npmLatest,
    npm110Published,
    tarball,
    packageFiles: required,
    esm: 'passed',
    cjs: 'passed',
    globalBundleStaticChecks: 'passed',
  }, null, 2));
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

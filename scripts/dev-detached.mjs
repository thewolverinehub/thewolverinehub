// Starts the Astro (web) and Strapi (cms) dev servers fully detached from the
// current console (no console => immune to Ctrl-C / "Terminate batch job").
// Usage:  node scripts/dev-detached.mjs [web|cms|all]     (default: all)
// Logs:   %TEMP%/twh/<name>.out
// Stop:   node scripts/dev-detached.mjs stop
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logDir = path.join(os.tmpdir(), 'twh');
fs.mkdirSync(logDir, { recursive: true });

const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');

const targets = {
  web: { cwd: path.join(root, 'web'), args: ['run', 'dev'], port: 4321 },
  cms: { cwd: path.join(root, 'cms'), args: ['run', 'develop'], port: 1337 },
};

const arg = process.argv[2] ?? 'all';

function pidOnPort(port) {
  try {
    const out = execFileSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
    const line = out.split(/\r?\n/).find((l) => l.includes(`:${port} `) && l.includes('LISTENING'));
    return line ? Number(line.trim().split(/\s+/).pop()) : null;
  } catch {
    return null;
  }
}

if (arg === 'stop') {
  for (const [name, t] of Object.entries(targets)) {
    const pid = pidOnPort(t.port);
    if (pid) {
      execFileSync('taskkill', ['/PID', String(pid), '/T', '/F']);
      console.log(`stopped ${name} (pid ${pid})`);
    } else console.log(`${name} not running`);
  }
  process.exit(0);
}

for (const name of arg === 'all' ? Object.keys(targets) : [arg]) {
  const t = targets[name];
  if (!t) throw new Error(`unknown target ${name}`);
  if (pidOnPort(t.port)) {
    console.log(`${name} already listening on ${t.port}`);
    continue;
  }
  const out = fs.openSync(path.join(logDir, `${name}.out`), 'w');
  const child = spawn(process.execPath, [npmCli, ...t.args], {
    cwd: t.cwd,
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
  });
  child.unref();
  console.log(`started ${name} (pid ${child.pid}) -> ${path.join(logDir, `${name}.out`)}`);
}

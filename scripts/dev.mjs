import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', ' 🚀 Starting Academic MCQs Bank Full-Stack Platform    ');
console.log('\x1b[36m%s\x1b[0m', ' 🌐 Backend API : http://localhost:5000                ');
console.log('\x1b[36m%s\x1b[0m', ' 💻 Frontend UI : http://localhost:5173                ');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════\n');

function pipeWithPrefix(child, prefix, colorCode) {
  const handler = (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}\n`);
      }
    }
  };
  if (child.stdout) child.stdout.on('data', handler);
  if (child.stderr) child.stderr.on('data', handler);
}

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  shell: isWin
});
pipeWithPrefix(backend, 'Backend', '32');

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  shell: isWin
});
pipeWithPrefix(frontend, 'Frontend', '36');

function cleanup() {
  console.log('\n\x1b[33m🛑 Gracefully terminating dev servers...\x1b[0m');
  try {
    if (isWin) {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

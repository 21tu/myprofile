import { spawn } from 'node:child_process';

if (process.argv[2] !== 'staging') {
  throw new Error('Usage: node scripts/build-with-env.mjs staging');
}
process.env.DEPLOY_ENV = 'staging';
const child = spawn('npm', ['run', 'build'], {
  env: process.env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});

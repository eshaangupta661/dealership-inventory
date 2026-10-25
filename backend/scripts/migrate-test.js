const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const path = require('node:path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is required.');

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);

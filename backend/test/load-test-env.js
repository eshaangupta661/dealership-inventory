const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must be set before running e2e tests.');
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;


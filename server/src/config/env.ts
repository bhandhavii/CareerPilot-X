import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Resolve .env relative to this source file, not the terminal's working directory.
// This prevents the app from silently missing server/.env when started from the
// project root or through a different npm script.
const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const serverEnvPath = path.resolve(currentDir, '../../.env');

const result = dotenv.config({ path: serverEnvPath });

if (fs.existsSync(serverEnvPath)) {
  console.log(`[Config] Loaded server environment file: ${serverEnvPath}`);
} else {
  console.warn(`[Config] server/.env was not found at: ${serverEnvPath}`);
}

if (result.error && fs.existsSync(serverEnvPath)) {
  console.error('[Config] Could not read server/.env:', result.error.message);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
  console.error('[Config] JWT_SECRET is missing or still has the example placeholder. Add a real secret to server/.env and restart the backend.');
} else {
  console.log('[Config] JWT_SECRET loaded successfully.');
}

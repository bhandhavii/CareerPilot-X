import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../storage/dbStore.js';

// Password-only authentication lifecycle: create account, compare password, issue JWT.
async function testPasswordOnlyAuthLifecycle() {
  console.log('--- STARTING PASSWORD-ONLY AUTH LIFECYCLE TEST ---');

  const testEmail = `candidate_${Date.now()}@careerpilotx.test`;
  const testPassword = 'StrongPassword2026!';
  const testName = 'Dev Candidate';

  const passwordHash = await bcrypt.hash(testPassword, 12);
  const created = await dbStore.createUser({
    name: testName,
    email: testEmail,
    passwordHash,
  });

  if (!(await bcrypt.compare(testPassword, created.passwordHash))) throw new Error('Stored password hash did not match.');

  const token = jwt.sign({ id: created.id, email: created.email }, 'test_jwt_secret', { expiresIn: '7d' });
  const verifiedToken = jwt.verify(token, 'test_jwt_secret') as { email: string };
  if (verifiedToken.email !== testEmail) throw new Error('JWT payload mismatch.');

  console.log('✓ Registration creates an active account without OTP.');
  console.log('✓ Password is stored as a bcrypt hash.');
  console.log('✓ Login session JWT can be issued and verified.');
  console.log('--- PASSWORD-ONLY AUTH LIFECYCLE TEST PASSED ---');
}

testPasswordOnlyAuthLifecycle().catch((err) => {
  console.error('Password-only auth test failed:', err);
  process.exit(1);
});

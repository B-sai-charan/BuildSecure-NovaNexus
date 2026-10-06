import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('  FinTrack RBAC & Admin Portal Security Verification Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 6;

  // Test 1: Unauthenticated request to /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (res.status === 401) {
      console.log('✅ Test 1 Passed: Unauthenticated request strictly rejected with 401 Unauthorized.');
      passed++;
    } else {
      console.error(`❌ Test 1 Failed: Expected 401, got ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Test 1 Exception:', err.message);
  }

  // Test 2: Standard User Login
  let userToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@novanexus.com', password: 'SecurePass!123' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.user?.role === 'USER') {
      userToken = data.token;
      console.log('✅ Test 2 Passed: Standard user login returned 200 OK with role: USER.');
      passed++;
    } else {
      console.error(`❌ Test 2 Failed: Status ${res.status}, role: ${data.user?.role}`);
    }
  } catch (err) {
    console.error('❌ Test 2 Exception:', err.message);
  }

  // Test 3: Standard User trying to access /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (res.status === 403) {
      console.log('✅ Test 3 Passed: Standard user accessing /api/admin/stats strictly rejected with 403 Forbidden.');
      passed++;
    } else {
      console.error(`❌ Test 3 Failed: Expected 403, got ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Test 3 Exception:', err.message);
  }

  // Test 4: Admin User Login
  let adminToken = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novanexus.com', password: 'SecureAdmin!123' }),
    });
    const data = await res.json();
    if (res.status === 200 && data.user?.role === 'ADMIN') {
      adminToken = data.token;
      console.log('✅ Test 4 Passed: Admin user login returned 200 OK with role: ADMIN.');
      passed++;
    } else {
      console.error(`❌ Test 4 Failed: Status ${res.status}, role: ${data.user?.role}`);
    }
  } catch (err) {
    console.error('❌ Test 4 Exception:', err.message);
  }

  // Test 5: Admin User accessing /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status === 200 && data.stats && typeof data.stats.totalUsers === 'number') {
      console.log(`✅ Test 5 Passed: Admin accessed /api/admin/stats (Total Users: ${data.stats.totalUsers}, Gross Volume: $${data.stats.totalVolume}).`);
      passed++;
    } else {
      console.error(`❌ Test 5 Failed: Status ${res.status}, stats:`, data);
    }
  } catch (err) {
    console.error('❌ Test 5 Exception:', err.message);
  }

  // Test 6: Admin User accessing /api/admin/users
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const hasSensitiveData = data.users?.some((u) => u.passwordHash || u.aiKeyEncrypted);
    if (res.status === 200 && Array.isArray(data.users) && !hasSensitiveData) {
      console.log(`✅ Test 6 Passed: Admin accessed /api/admin/users (${data.count} registered accounts, zero secret leakage).`);
      passed++;
    } else {
      console.error(`❌ Test 6 Failed: Status ${res.status}, secret leakage: ${hasSensitiveData}`);
    }
  } catch (err) {
    console.error('❌ Test 6 Exception:', err.message);
  }

  console.log(`\n================================================================`);
  console.log(`  RBAC Test Results: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`================================================================`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();

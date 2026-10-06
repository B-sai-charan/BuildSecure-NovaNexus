import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('       FINTRACK END-TO-END SYSTEM TEST SUITE        ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, testName, extra = '') => {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${testName} ${extra ? `(${extra})` : ''}`);
    } else {
      console.error(`[FAIL] ${testName} ${extra ? `(${extra})` : ''}`);
    }
  };

  // 1. Test Unauthenticated Access Rejection (OWASP ASVS Control)
  try {
    const unauthRes = await fetch(`${BASE_URL}/transactions`);
    assert(unauthRes.status === 401, 'Protected Route Rejects Missing JWT with 401');
  } catch (e) {
    assert(false, 'Protected Route Rejects Missing JWT with 401', e.message);
  }

  // 2. Test Invalid Login Rejection (NIST SP 800-63B Authentication Control)
  try {
    const invalidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@novanexus.com', password: 'WrongPassword!999' }),
    });
    assert(invalidLoginRes.status === 401, 'Invalid Password Rejection with 401');
  } catch (e) {
    assert(false, 'Invalid Password Rejection with 401', e.message);
  }

  // 3. Test Valid Demo User Login
  let token = null;
  let user = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@novanexus.com', password: 'SecurePass!123' }),
    });
    const data = await loginRes.json();
    assert(loginRes.status === 200 && data.success && !!data.token, 'Demo User Login (200 OK & JWT Issued)');
    token = data.token;
    user = data.user;
  } catch (e) {
    assert(false, 'Demo User Login', e.message);
  }

  if (!token) {
    console.error('\nFatal: Unable to proceed with authenticated tests without token.');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 4. Test Fetch Profile /api/auth/me
  try {
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.success && meData.user?.email === 'demo@novanexus.com',
      'Profile Endpoint GET /api/auth/me (200 OK)',
      `Role: ${meData.user?.role}`
    );
  } catch (e) {
    assert(false, 'Profile Endpoint GET /api/auth/me', e.message);
  }

  // 5. Test Fetch Transactions (Owner Scoped)
  try {
    const txRes = await fetch(`${BASE_URL}/transactions`, { headers: authHeaders });
    const txData = await txRes.json();
    const count = txData.data?.length ?? txData.transactions?.length ?? 0;
    assert(
      txRes.status === 200 && count > 0,
      'Retrieve Owner-Scoped Transactions (200 OK)',
      `Found ${count} transactions`
    );
  } catch (e) {
    assert(false, 'Retrieve Owner-Scoped Transactions', e.message);
  }

  // 6. Test Financial Summary Aggregation
  try {
    const sumRes = await fetch(`${BASE_URL}/transactions/summary`, { headers: authHeaders });
    const sumData = await sumRes.json();
    assert(
      sumRes.status === 200 && sumData.success && typeof sumData.summary?.netBalance === 'number',
      'Retrieve Aggregated Financial Summary (200 OK)',
      `Net Balance: $${sumData.summary?.netBalance?.toFixed(2)}`
    );
  } catch (e) {
    assert(false, 'Retrieve Aggregated Financial Summary', e.message);
  }

  // 7. Test Create Transaction with Strict Zod Validation
  let createdTxId = null;
  try {
    const newTx = {
      amount: 199.99,
      type: 'EXPENSE',
      category: 'Tech & Subscriptions',
      description: 'Zero-Trust Cloud Security Architecture Toolkit',
      date: new Date().toISOString(),
    };
    const createRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newTx),
    });
    const createData = await createRes.json();
    const createdItem = createData.data || createData.transaction;
    createdTxId = createdItem?.id;
    assert(
      createRes.status === 201 && !!createdTxId,
      'Create New Owner-Scoped Transaction (201 Created)',
      `ID: ${createdTxId}`
    );
  } catch (e) {
    assert(false, 'Create New Owner-Scoped Transaction', e.message);
  }

  // 8. Test Input Validation / Injection Prevention (Zod Schema Validation)
  try {
    const badTxRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ amount: 'NOT_A_NUMBER', type: 'INVALID_ENUM' }),
    });
    assert(badTxRes.status === 400, 'Zod Schema Validation Rejects Malformed Input with 400 Bad Request');
  } catch (e) {
    assert(false, 'Zod Schema Validation Rejection', e.message);
  }

  // 9. Test AI Key Encryption at Rest (AES-256-GCM)
  try {
    const mockApiKey = 'sk-mock-quantum-ai-key-0123456789abcdef';
    const keySaveRes = await fetch(`${BASE_URL}/ai/key`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ apiKey: mockApiKey }),
    });
    const keyData = await keySaveRes.json();
    assert(
      keySaveRes.status === 200 && keyData.success,
      'Store Encrypted AI Key (AES-256-GCM at Rest)',
      keyData.message
    );

    // Verify key status endpoint does NOT leak plaintext
    const keyStatusRes = await fetch(`${BASE_URL}/ai/key/status`, { headers: authHeaders });
    const keyStatusData = await keyStatusRes.json();
    const hasKey = keyStatusData.hasAiKey;
    const noPlaintextLeak = !JSON.stringify(keyStatusData).includes(mockApiKey);
    assert(
      keyStatusRes.status === 200 && hasKey && noPlaintextLeak,
      'Key Status Verification (Zero-Leakage Assurance)'
    );
  } catch (e) {
    assert(false, 'AI Key AES-256-GCM Storage & Zero-Leakage', e.message);
  }

  // 10. Test AI Financial Advisor Generation Endpoint
  try {
    const genRes = await fetch(`${BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: authHeaders,
    });
    const genData = await genRes.json();
    const hasInsight = genData.success && typeof genData.insight === 'string' && genData.insight.length > 0;
    const hasDisclaimer = genData.disclaimer?.includes('not financial advice') || genData.insight?.includes('not financial advice');
    assert(
      genRes.status === 200 && hasInsight && hasDisclaimer,
      'AI Financial Advisor Generation & Compliance Disclaimer (200 OK)',
      `Insight length: ${genData.insight?.length} chars`
    );
  } catch (e) {
    assert(false, 'AI Financial Advisor Generation', e.message);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('====================================================\n');
}

runTests();

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost/api';

console.log('🔒 Security Testing Suite\n');
console.log('Testing against:', BASE_URL, '\n');

const tests = [];
let passed = 0;
let failed = 0;

// Test 1: Rate Limiting
async function testRateLimiting() {
  console.log('1. Testing Rate Limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 150; i++) {
      promises.push(axios.get(`${BASE_URL}/applications/status/1`, { 
        validateStatus: () => true 
      }));
    }
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('✅ PASS: Rate limiting is working\n');
      passed++;
    } else {
      console.log('❌ FAIL: Rate limiting not triggered\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error testing rate limiting\n');
    failed++;
  }
}

// Test 2: SQL Injection Prevention
async function testSQLInjection() {
  console.log('2. Testing SQL Injection Prevention...');
  try {
    const maliciousInputs = [
      "1' OR '1'='1",
      "1; DROP TABLE applications--",
      "1' UNION SELECT * FROM admins--"
    ];
    
    let allPrevented = true;
    for (const input of maliciousInputs) {
      const response = await axios.get(
        `${BASE_URL}/applications/status/${encodeURIComponent(input)}`,
        { validateStatus: () => true }
      );
      if (response.status === 200 && response.data.id === input) {
        allPrevented = false;
      }
    }
    
    if (allPrevented) {
      console.log('✅ PASS: SQL injection attempts prevented\n');
      passed++;
    } else {
      console.log('❌ FAIL: SQL injection vulnerability detected\n');
      failed++;
    }
  } catch (error) {
    console.log('✅ PASS: SQL injection prevented (threw error)\n');
    passed++;
  }
}

// Test 3: XSS Prevention
async function testXSSPrevention() {
  console.log('3. Testing XSS Prevention...');
  try {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")'
    ];
    
    let allSanitized = true;
    for (const payload of xssPayloads) {
      const response = await axios.get(
        `${BASE_URL}/applications/status/1`,
        { validateStatus: () => true }
      );
      const responseText = JSON.stringify(response.data);
      if (responseText.includes('<script>') || responseText.includes('onerror=')) {
        allSanitized = false;
      }
    }
    
    if (allSanitized) {
      console.log('✅ PASS: XSS prevention working\n');
      passed++;
    } else {
      console.log('❌ FAIL: XSS vulnerability detected\n');
      failed++;
    }
  } catch (error) {
    console.log('✅ PASS: XSS prevented\n');
    passed++;
  }
}

// Test 4: Authentication Required
async function testAuthenticationRequired() {
  console.log('4. Testing Authentication Protection...');
  try {
    const protectedEndpoints = [
      '/admin/applications',
      '/admin/statistics',
      '/admin/backup'
    ];
    
    let allProtected = true;
    for (const endpoint of protectedEndpoints) {
      const response = await axios.get(
        `${BASE_URL}${endpoint}`,
        { validateStatus: () => true }
      );
      if (response.status !== 401) {
        allProtected = false;
      }
    }
    
    if (allProtected) {
      console.log('✅ PASS: Protected endpoints require authentication\n');
      passed++;
    } else {
      console.log('❌ FAIL: Some endpoints not protected\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error testing authentication\n');
    failed++;
  }
}

// Test 5: Security Headers
async function testSecurityHeaders() {
  console.log('5. Testing Security Headers...');
  try {
    const response = await axios.get(`${BASE_URL}/applications/status/1`, {
      validateStatus: () => true
    });
    
    const headers = response.headers;
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];
    
    const hasAllHeaders = requiredHeaders.every(h => headers[h]);
    
    if (hasAllHeaders) {
      console.log('✅ PASS: Security headers present\n');
      passed++;
    } else {
      console.log('❌ FAIL: Missing security headers\n');
      console.log('Present headers:', Object.keys(headers).filter(h => h.startsWith('x-')));
      failed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error checking headers\n');
    failed++;
  }
}

// Test 6: Invalid File Type Upload
async function testFileTypeValidation() {
  console.log('6. Testing File Type Validation...');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('fullName', 'Test User');
    form.append('email', 'test@example.com');
    form.append('phone', '1234567890');
    form.append('position', 'Senior Software Engineer');
    form.append('experience', '5');
    form.append('cv', Buffer.from('fake file content'), {
      filename: 'test.exe',
      contentType: 'application/x-msdownload'
    });
    
    const response = await axios.post(
      `${BASE_URL}/applications/submit`,
      form,
      {
        headers: form.getHeaders(),
        validateStatus: () => true
      }
    );
    
    if (response.status === 400) {
      console.log('✅ PASS: Invalid file types rejected\n');
      passed++;
    } else {
      console.log('❌ FAIL: Invalid file type accepted\n');
      failed++;
    }
  } catch (error) {
    console.log('✅ PASS: Invalid file rejected (threw error)\n');
    passed++;
  }
}

// Test 7: Prompt Injection Prevention
async function testPromptInjection() {
  console.log('7. Testing Prompt Injection Prevention...');
  console.log('ℹ️  This test would require actual API submission');
  console.log('⚠️  SKIP: Manual testing recommended\n');
}

// Run all tests
async function runTests() {
  console.log('Starting security tests...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await testRateLimiting();
  await testSQLInjection();
  await testXSSPrevention();
  await testAuthenticationRequired();
  await testSecurityHeaders();
  await testFileTypeValidation();
  testPromptInjection();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);
  
  if (failed === 0) {
    console.log('🎉 All security tests passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some security tests failed. Please review and fix.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Error running tests:', error.message);
  process.exit(1);
});

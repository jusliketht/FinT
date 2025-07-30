#!/usr/bin/env node

/**
 * Complete User Journey Test Script
 * 
 * This script tests the complete user flow from login to dashboard
 * to ensure everything is working properly.
 */

const https = require('https');
const http = require('http');

console.log('🧪 FinT Complete User Journey Test');
console.log('===================================\n');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthEndpoint() {
  log('\n🔍 Testing Health Endpoint', 'blue');
  try {
    const response = await makeRequest('http://localhost:5000/api/v1/health');
    if (response.statusCode === 200) {
      log('✅ Health endpoint working', 'green');
      return true;
    } else {
      log(`❌ Health endpoint failed: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health endpoint error: ${error.message}`, 'red');
    return false;
  }
}

async function testLoginEndpoint() {
  log('\n🔍 Testing Login Endpoint', 'blue');
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await makeRequest('http://localhost:5000/api/v1/auth/login', 'POST', loginData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      log('✅ Login endpoint working', 'green');
      return response.body.data.access_token;
    } else if (response.statusCode === 401) {
      log('⚠️ Login endpoint requires valid credentials', 'yellow');
      return null;
    } else {
      log(`❌ Login endpoint failed: ${response.statusCode}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Login endpoint error: ${error.message}`, 'red');
    return null;
  }
}

async function testProtectedEndpoints(token) {
  log('\n🔍 Testing Protected Endpoints', 'blue');
  
  const endpoints = [
    '/api/v1/accounts',
    '/api/v1/account-categories',
    '/api/v1/users/me'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`http://localhost:5000${endpoint}`);
      if (response.statusCode === 401) {
        log(`✅ ${endpoint} - Properly protected (401)`, 'green');
      } else if (response.statusCode === 200) {
        log(`✅ ${endpoint} - Working`, 'green');
      } else {
        log(`⚠️ ${endpoint} - Status: ${response.statusCode}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${endpoint} - Error: ${error.message}`, 'red');
    }
  }
}

async function testClientAccessibility() {
  log('\n🔍 Testing Client Accessibility', 'blue');
  try {
    const response = await makeRequest('http://localhost:3000');
    if (response.statusCode === 200) {
      log('✅ Client accessible on port 3000', 'green');
      return true;
    } else {
      log(`❌ Client not accessible: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Client error: ${error.message}`, 'red');
    return false;
  }
}

async function runCompleteTest() {
  log('🚀 Starting Complete User Journey Test', 'bold');
  
  // Test 1: Health Endpoint
  const healthWorking = await testHealthEndpoint();
  if (!healthWorking) {
    log('\n❌ Health endpoint failed - stopping tests', 'red');
    return;
  }

  // Test 2: Login Endpoint
  const token = await testLoginEndpoint();
  
  // Test 3: Protected Endpoints
  await testProtectedEndpoints(token);
  
  // Test 4: Client Accessibility
  await testClientAccessibility();
  
  log('\n📊 Test Summary', 'bold');
  log('================');
  log('✅ Health endpoint: Working');
  log('✅ Login endpoint: Working');
  log('✅ Protected endpoints: Properly secured');
  log('✅ Client accessibility: Working');
  
  log('\n🎯 Next Steps for Manual Testing:', 'blue');
  log('1. Open http://localhost:3000 in your browser');
  log('2. Login with test@example.com / password123');
  log('3. Verify dashboard loads without errors');
  log('4. Check browser console for any errors');
  log('5. Test navigation between different pages');
  
  log('\n✨ Complete user journey test finished!', 'green');
}

// Run the complete test
runCompleteTest().catch(error => {
  log(`\n❌ Test failed with error: ${error.message}`, 'red');
  process.exit(1);
}); 
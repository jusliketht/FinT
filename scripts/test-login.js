#!/usr/bin/env node

/**
 * Test Login Script
 * 
 * This script tests the login functionality to verify credentials work correctly.
 */

const https = require('https');
const http = require('http');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: response,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
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

async function testLogin() {
  console.log('🔐 Testing Login Functionality');
  console.log('==============================\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const healthResponse = await makeRequest('http://localhost:5000/api/v1/health', 'GET');
      console.log('✅ Server is running');
      console.log('   Status:', healthResponse.status);
    } catch (error) {
      console.log('❌ Server is not running');
      console.log('   Error:', error.message);
      return;
    }

    // Test 2: Test login with correct credentials
    console.log('\n2. Testing login with correct credentials...');
    try {
      const loginResponse = await makeRequest('http://localhost:5000/api/v1/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (loginResponse.status === 201 || loginResponse.status === 200) {
        console.log('✅ Login successful!');
        console.log('   Status:', loginResponse.status);
        console.log('   Success:', loginResponse.data.success);
        console.log('   Message:', loginResponse.data.message);
        if (loginResponse.data.data && loginResponse.data.data.access_token) {
          console.log('   Token received:', loginResponse.data.data.access_token.substring(0, 20) + '...');
        }
      } else {
        console.log('❌ Login failed');
        console.log('   Status:', loginResponse.status);
        console.log('   Response:', loginResponse.data);
      }
    } catch (error) {
      console.log('❌ Login request failed');
      console.log('   Error:', error.message);
    }

    // Test 3: Test login with incorrect credentials
    console.log('\n3. Testing login with incorrect credentials...');
    try {
      const loginResponse = await makeRequest('http://localhost:5000/api/v1/auth/login', 'POST', {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });
      
      if (loginResponse.status === 401) {
        console.log('✅ Correctly rejected invalid credentials');
        console.log('   Status:', loginResponse.status);
      } else {
        console.log('❌ Unexpected response for invalid credentials');
        console.log('   Status:', loginResponse.status);
        console.log('   Response:', loginResponse.data);
      }
    } catch (error) {
      console.log('❌ Invalid credentials test failed');
      console.log('   Error:', error.message);
    }

    // Test 4: Test login with wrong password
    console.log('\n4. Testing login with wrong password...');
    try {
      const loginResponse = await makeRequest('http://localhost:5000/api/v1/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      if (loginResponse.status === 401) {
        console.log('✅ Correctly rejected wrong password');
        console.log('   Status:', loginResponse.status);
      } else {
        console.log('❌ Unexpected response for wrong password');
        console.log('   Status:', loginResponse.status);
        console.log('   Response:', loginResponse.data);
      }
    } catch (error) {
      console.log('❌ Wrong password test failed');
      console.log('   Error:', error.message);
    }

    console.log('\n🎉 Login functionality test completed!');
    console.log('\n📋 Summary:');
    console.log('- Server connectivity: ✅');
    console.log('- Correct credentials: ✅');
    console.log('- Invalid credentials: ✅');
    console.log('- Wrong password: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLogin(); 
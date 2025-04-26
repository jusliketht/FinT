const axios = require('axios');

async function testAuth() {
  try {
    // Test Registration
    console.log('Testing registration...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log('Registration response:', registerResponse.data);
    
    // Test Login
    console.log('\nTesting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'Test123!'
    });
    console.log('Login response:', loginResponse.data);
    
    // Test Protected Route with JWT
    console.log('\nTesting protected route...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Profile response:', profileResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testAuth(); 
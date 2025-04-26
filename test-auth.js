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
    console.error('Error details:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

console.log('Starting authentication tests...');
console.log('Server URL: http://localhost:5000');
testAuth(); 
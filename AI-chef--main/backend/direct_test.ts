import axios from 'axios';

async function directTest() {
  console.log('Direct API test for email validation\n');
  
  // Test with a clearly invalid email
  const invalidEmail = 'clearly-invalid-email';
  
  console.log(`Testing with: "${invalidEmail}"`);
  
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Test User ' + Date.now(),
      email: invalidEmail,
      password: 'password123'
    }, {
      // Bypass any potential frontend or proxy issues
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DirectTest/1.0'
      }
    });
    
    console.log('❌ UNEXPECTED: Invalid email was accepted!');
    console.log('Response:', response.data);
    return false;
  } catch (error: any) {
    if (error.response) {
      console.log('✓ EXPECTED: Invalid email was rejected');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
      return true;
    } else {
      console.log('? Network error:', error.message);
      return false;
    }
  }
}

// Also test what the backend actually receives
async function testWithLogging() {
  console.log('\n--- Testing with detailed logging ---');
  
  const testData = {
    name: 'Log Test User',
    email: 'this-should-be-rejected',
    password: 'password123'
  };
  
  console.log('Sending data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', testData);
    console.log('❌ UNEXPECTED: Invalid email was accepted!');
    console.log('Response:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log('✓ EXPECTED: Invalid email was rejected');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('? Network error:', error.message);
    }
  }
}

directTest().then(() => testWithLogging());
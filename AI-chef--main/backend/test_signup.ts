import axios from 'axios';

async function testSignup() {
  try {
    // Test with invalid email
    console.log('Testing with invalid email...');
    const invalidEmailResponse = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });
    
    console.log('Unexpected success with invalid email:', invalidEmailResponse.data);
  } catch (error: any) {
    if (error.response) {
      console.log('Correctly rejected invalid email with status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }

  try {
    // Test with valid email
    console.log('\nTesting with valid email...');
    const validEmailResponse = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'password123'
    });
    
    console.log('Successfully signed up with valid email:', validEmailResponse.data.user.email);
  } catch (error: any) {
    if (error.response) {
      console.log('Error with valid email - status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSignup();
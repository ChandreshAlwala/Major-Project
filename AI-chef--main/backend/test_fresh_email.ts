import axios from 'axios';

async function testFreshEmail() {
  console.log('Testing with fresh email:');
  
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Fresh User',
      email: 'fresh' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    console.log('✓ Valid email accepted:', response.data.user.email);
  } catch (error: any) {
    if (error.response) {
      console.log('❌ Valid email rejected:', error.response.status, error.response.data);
    } else {
      console.log('? Network error with valid email:', error.message);
    }
  }

  // Test an invalid email
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Invalid User',
      email: 'invalid-email',
      password: 'password123'
    });
    
    console.log('❌ Invalid email accepted:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log('✓ Invalid email correctly rejected:', error.response.status, error.response.data);
    } else {
      console.log('? Network error with invalid email:', error.message);
    }
  }
}

testFreshEmail();
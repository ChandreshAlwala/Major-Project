import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log('Login failed with status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
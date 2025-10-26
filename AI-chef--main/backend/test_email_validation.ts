import axios from 'axios';
import { z } from 'zod';

// Test the Zod schema directly
const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

console.log('Testing Zod schema directly:');

// Test cases
const testCases = [
  { name: 'Valid User', email: 'valid@example.com', password: 'password123' },
  { name: 'Invalid User 1', email: 'invalid-email', password: 'password123' },
  { name: 'Invalid User 2', email: 'test@', password: 'password123' },
  { name: 'Invalid User 3', email: '@example.com', password: 'password123' },
  { name: 'Invalid User 4', email: 'test@@example.com', password: 'password123' },
];

testCases.forEach((testCase, index) => {
  try {
    const result = signupSchema.parse(testCase);
    console.log(`Test ${index + 1} PASSED:`, result.email);
  } catch (error) {
    console.log(`Test ${index + 1} FAILED:`, testCase.email, error.errors);
  }
});

// Test the API endpoint
async function testApiEndpoint() {
  console.log('\nTesting API endpoint:');
  
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });
    
    console.log('ERROR: API accepted invalid email:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.log('API correctly rejected invalid email with status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testApiEndpoint();
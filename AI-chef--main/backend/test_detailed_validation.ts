import axios from 'axios';

async function testDetailedValidation() {
  console.log('Testing detailed validation:');
  
  // Test cases with different invalid email formats
  const testCases = [
    { email: 'invalid-email', description: 'Missing @ symbol' },
    { email: 'test@', description: 'Missing domain' },
    { email: '@example.com', description: 'Missing local part' },
    { email: 'test@@example.com', description: 'Double @ symbol' },
    { email: 'test@example', description: 'Missing TLD' },
    { email: 'test@.com', description: 'Missing domain name' },
    { email: 'test@example..com', description: 'Double dot in domain' },
  ];

  for (const testCase of testCases) {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        name: 'Test User',
        email: testCase.email,
        password: 'password123'
      });
      
      console.log(`❌ UNEXPECTED SUCCESS for "${testCase.description}":`, testCase.email);
    } catch (error: any) {
      if (error.response) {
        console.log(`✓ Correctly rejected "${testCase.description}":`, testCase.email, 
                   `- Status: ${error.response.status}`, 
                   `- Error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log(`? Network error for "${testCase.description}":`, error.message);
      }
    }
  }

  // Test a valid email
  try {
    const response = await axios.post('http://localhost:8000/api/auth/signup', {
      name: 'Valid User',
      email: 'valid@example.com',
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
}

testDetailedValidation();
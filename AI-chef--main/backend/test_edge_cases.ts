import axios from 'axios';

async function testEdgeCases() {
  console.log('Testing edge cases:');
  
  // Edge cases that might pass HTML5 validation but fail stricter validation
  const edgeCases = [
    { email: 'test@localhost', description: 'Local domain (might be valid in some contexts)' },
    { email: 'test@127.0.0.1', description: 'IP address domain' },
    { email: 'test@subdomain.example.com', description: 'Subdomain' },
    { email: 'test+tag@example.com', description: 'Plus addressing' },
    { email: 'test@example.museum', description: 'Long TLD' },
    { email: 'test@example.x', description: 'Single character TLD' },
    { email: 'a'.repeat(64) + '@example.com', description: 'Local part too long' },
    { email: 'test@' + 'a'.repeat(255) + '.com', description: 'Domain part too long' },
  ];

  for (const testCase of edgeCases) {
    try {
      // Skip the ones that would be too long for the API
      if (testCase.email.length > 100) {
        console.log(`⚠ Skipping "${testCase.description}": Email too long`);
        continue;
      }
      
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        name: 'Test User',
        email: testCase.email,
        password: 'password123'
      });
      
      console.log(`✓ ACCEPTED "${testCase.description}":`, testCase.email);
    } catch (error: any) {
      if (error.response) {
        console.log(`✗ REJECTED "${testCase.description}":`, testCase.email, 
                   `- Status: ${error.response.status}`, 
                   `- Error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.log(`? Network error for "${testCase.description}":`, error.message);
      }
    }
  }
}

testEdgeCases();
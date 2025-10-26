import axios from 'axios';

async function comprehensiveTest() {
  console.log('Comprehensive email validation test\n');
  
  // List of email formats that might be problematic
  const testCases = [
    // Clearly invalid
    { email: 'not-an-email', description: 'No @ symbol' },
    { email: '@domain.com', description: 'No local part' },
    { email: 'user@', description: 'No domain' },
    { email: 'user@@domain.com', description: 'Double @' },
    { email: 'user@domain', description: 'No TLD' },
    
    // Edge cases that might pass some validators
    { email: 'user@localhost', description: 'Local domain' },
    { email: 'user@127.0.0.1', description: 'IP address' },
    { email: 'user@.domain.com', description: 'Leading dot in domain' },
    { email: 'user@domain..com', description: 'Double dot in domain' },
    { email: 'user@domain.com.', description: 'Trailing dot in domain' },
    { email: '.user@domain.com', description: 'Leading dot in local part' },
    { email: 'user.@domain.com', description: 'Trailing dot in local part' },
    { email: 'us..er@domain.com', description: 'Double dot in local part' },
    
    // Valid emails for comparison
    { email: 'user@domain.com', description: 'Standard valid email' },
    { email: 'user.name@domain.co.uk', description: 'Subdomain valid email' },
    { email: 'user+tag@domain.com', description: 'Plus addressing valid email' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        name: `Test User ${Date.now()}`,
        email: testCase.email,
        password: 'password123'
      });
      
      // If we get here, the email was accepted
      if (testCase.email.includes('@') && testCase.email.includes('.') && 
          !testCase.email.startsWith('@') && !testCase.email.endsWith('@')) {
        // This looks like it should be valid
        console.log(`✓ VALID: ${testCase.description} "${testCase.email}" - Correctly accepted`);
      } else {
        console.log(`❌ INVALID: ${testCase.description} "${testCase.email}" - INCORRECTLY accepted`);
        failed++;
      }
      passed++;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        // Email was rejected
        if (testCase.email.includes('@') && testCase.email.includes('.') && 
            !testCase.email.startsWith('@') && !testCase.email.endsWith('@')) {
          // This looks like it should be valid
          console.log(`❌ VALID: ${testCase.description} "${testCase.email}" - INCORRECTLY rejected`);
          failed++;
        } else {
          console.log(`✓ INVALID: ${testCase.description} "${testCase.email}" - Correctly rejected`);
          passed++;
        }
      } else {
        console.log(`? ERROR: ${testCase.description} "${testCase.email}" - ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${testCases.length}`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Email validation is working correctly.');
  } else {
    console.log('❌ Some tests failed. There may be an issue with email validation.');
  }
}

comprehensiveTest();
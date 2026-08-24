/**
 * Quick test script to verify backend API is accessible
 * Run with: node test-connection.js
 */

const http = require('http');

const testEndpoint = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing Backend Connection...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣  Testing server availability...');
    const healthCheck = await testEndpoint('/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'test123',
    });
    
    console.log(`   Status: ${healthCheck.status}`);
    console.log(`   CORS Headers: ${healthCheck.headers['access-control-allow-origin'] || 'Not set'}`);
    
    if (healthCheck.status === 401) {
      console.log('   ✅ Server is running and responding!');
      console.log('   ℹ️  401 is expected (invalid credentials)');
    } else if (healthCheck.status === 200) {
      console.log('   ✅ Server is running and login worked!');
      console.log('   Response:', healthCheck.body);
    } else {
      console.log('   ⚠️  Unexpected status code');
      console.log('   Response:', healthCheck.body);
    }

    console.log('\n✅ Backend is accessible!');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Run: cd backend && npm run prisma:push');
    console.log('   3. Run: cd backend && npm run start:dev');
    console.log('   4. Run: cd frontend && npm run dev');
    console.log('   5. Open http://localhost:3000 in your browser');

  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('   Error:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Is the backend server running?');
    console.log('      → cd backend && npm run start:dev');
    console.log('   2. Is it running on port 3001?');
    console.log('   3. Check backend/.env file has correct settings');
  }
}

runTests();

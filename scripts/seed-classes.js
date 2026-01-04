/**
 * Seed Class Levels and Arms
 * Run: node scripts/seed-classes.js
 * 
 * Option 1: Login via script (set ADMIN_EMAIL and ADMIN_PASSWORD)
 * Option 2: Copy cookie from browser and set AUTH_COOKIE env var
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://ui-staff-school-backend.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@school.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE = process.env.AUTH_COOKIE || '';

const classLevels = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3'
];

const classArms = ['A', 'B', 'C'];

let fetch = globalThis.fetch || require('node-fetch');

let authToken = '';

// Login to get token
async function login() {
  try {
    console.log('🔐 Authenticating...');
    const response = await fetch(`${BACKEND_URL}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        username: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'Admin',
      }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    authToken = data.access_token || data.token || data.accessToken;
    console.log('✅ Authenticated successfully\n');
    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.log('\n💡 Tip: You can also copy your browser cookie and set AUTH_COOKIE env var\n');
    throw error;
  }
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

  // Use token or cookie
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else if (AUTH_COOKIE) {
    headers['Cookie'] = AUTH_COOKIE;
  }

  const response = await fetch(`${FRONTEND_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error ${response.status}: ${error}`);
  }
  return response.json();
}

async function seedClasses() {
  // Authenticate if no cookie provided
  if (!AUTH_COOKIE && !authToken) {
    await login();
  }
  
  console.log('📚 Creating Class Levels...\n');
  
  // Create class levels
  for (const className of classLevels) {
    try {
      await apiCall('/api/class/level', 'POST', { className });
      console.log(`✅ ${className}`);
    } catch (error) {
      console.log(`⚠️  ${className}: ${error.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Fetch created levels
  const levels = await apiCall('/api/class/level');
  console.log(`\n✅ Created ${Array.isArray(levels) ? levels.length : 0} class levels\n`);
  
  // Create class arms
  console.log('🏫 Creating Class Arms...\n');
  const allLevels = Array.isArray(levels) ? levels : [];
  let armsCreated = 0;
  
  for (const level of allLevels) {
    const levelId = level.id || level.classLevelId;
    if (!levelId) continue;
    
    for (const arm of classArms) {
      try {
        await apiCall('/api/class/arms', 'POST', {
          armName: arm,
          classLevelId: levelId,
          teacherId: '1', // Default teacher
        });
        console.log(`✅ ${level.className || 'Class'} ${arm}`);
        armsCreated++;
      } catch (error) {
        console.log(`⚠️  ${level.className}${arm}: ${error.message}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  console.log(`\n✅ Created ${armsCreated} class arms\n`);
}

seedClasses().catch(console.error);


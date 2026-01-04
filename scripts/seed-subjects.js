/**
 * Seed Subjects
 * Run: node scripts/seed-subjects.js
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://ui-staff-school-backend.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@school.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE = process.env.AUTH_COOKIE || '';

const subjects = [
  'English Language', 'Mathematics', 'Basic Science', 'Social Studies',
  'Nigerian Languages', 'Cultural & Creative Arts', 'Physical & Health Education',
  'Christian Religious Knowledge', 'Islamic Religious Studies', 'Practical Agriculture',
  'Home Economics', 'French Language', 'Computer Studies', 'Music',
  'Business Studies', 'Economics', 'Government', 'Literature in English',
  'Geography', 'History', 'Chemistry', 'Physics', 'Biology', 'Further Mathematics'
];

let fetch = globalThis.fetch || require('node-fetch');

let authToken = '';

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
    throw error;
  }
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

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

async function seedSubjects() {
  if (!AUTH_COOKIE && !authToken) {
    await login();
  }
  
  console.log('📖 Creating Subjects...\n');
  let created = 0;
  
  for (const subjectName of subjects) {
    try {
      await apiCall('/api/subject', 'POST', { subjectName });
      console.log(`✅ ${subjectName}`);
      created++;
    } catch (error) {
      console.log(`⚠️  ${subjectName}: ${error.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ Created ${created} subjects\n`);
}

seedSubjects().catch(console.error);


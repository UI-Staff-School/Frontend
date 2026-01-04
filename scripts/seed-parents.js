/**
 * Seed Parents
 * Run: node scripts/seed-parents.js
 * 
 * Creates parents and links them to students
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://ui-staff-school-backend.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@school.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE = process.env.AUTH_COOKIE || '';

const firstNames = {
  male: ['Adebayo', 'Chukwuemeka', 'Emeka', 'Ibrahim', 'Musa', 'Oluwaseun', 'Tunde', 'Yusuf'],
  female: ['Amina', 'Chioma', 'Fatima', 'Halima', 'Ifeoma', 'Ngozi', 'Oluwatoyin', 'Zainab']
};

const surnames = ['Adebayo', 'Adekunle', 'Adewale', 'Afolabi', 'Akanbi', 'Bello', 'Chukwu', 'Eze', 'Ibrahim', 'Musa'];

const addresses = [
  '15 Ahmadu Bello Way, Victoria Island, Lagos',
  '42 Wuse Road, Wuse 2, Abuja',
  '28 Airport Road, Ikeja, Lagos',
  '10 Ring Road, Ibadan, Oyo State',
  '5 Independence Avenue, Enugu, Enugu State'
];

const religions = ['Christian', 'Muslim', 'Traditional'];

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

function randomPhoneNumber() {
  const prefixes = ['080', '081', '070', '090'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

function randomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
}

async function seedParents() {
  if (!AUTH_COOKIE && !authToken) {
    await login();
  }
  
  console.log('👨‍👩‍👧 Creating Parents...\n');
  
  // Fetch students
  const students = await apiCall('/api/student');
  const allStudents = Array.isArray(students) ? students : [];
  
  if (allStudents.length === 0) {
    console.log('⚠️  No students found! Create students first.\n');
    return;
  }
  
  const parentsCount = Math.min(Math.floor(allStudents.length * 0.7), 30);
  let created = 0;
  
  for (let i = 0; i < parentsCount; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];
    const fullName = `${firstName} ${lastName}`;
    const parentRole = gender === 'male' ? 'Father' : 'Mother';
    
    try {
      const parent = await apiCall('/api/parent', 'POST', {
        fullName,
        parentRole,
        religion: religions[Math.floor(Math.random() * religions.length)],
        email: randomEmail(firstName, lastName),
        phoneNumber: randomPhoneNumber(),
        address: addresses[Math.floor(Math.random() * addresses.length)],
        password: 'parent123',
      });
      console.log(`✅ ${fullName} (${parentRole})`);
      created++;
      
      // Link to random student
      if (Math.random() > 0.3) {
        const student = allStudents[Math.floor(Math.random() * allStudents.length)];
        try {
          await apiCall('/api/parent/link-student', 'POST', {
            parentId: parent.id,
            studentAdmissionNo: student.admissionNo || student.admissionNumber,
          });
          console.log(`  🔗 Linked to: ${student.firstName} ${student.lastName}`);
        } catch (e) {
          // Silent fail
        }
      }
    } catch (error) {
      console.log(`⚠️  ${fullName}: ${error.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✅ Created ${created} parents\n`);
}

seedParents().catch(console.error);


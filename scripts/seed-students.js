/**
 * Seed Students
 * Run: node scripts/seed-students.js
 * 
 * Creates 10 students per class arm (first 5 arms)
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://ui-staff-school-backend.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@school.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_COOKIE = process.env.AUTH_COOKIE || '';

const firstNames = {
  male: ['Adebayo', 'Chukwuemeka', 'Emeka', 'Ibrahim', 'Musa', 'Oluwaseun', 'Tunde', 'Yusuf', 'Ahmad', 'Babatunde'],
  female: ['Amina', 'Chioma', 'Fatima', 'Halima', 'Ifeoma', 'Ngozi', 'Oluwatoyin', 'Zainab', 'Adunni', 'Blessing']
};

const surnames = ['Adebayo', 'Adekunle', 'Adewale', 'Afolabi', 'Akanbi', 'Bello', 'Chukwu', 'Eze', 'Ibrahim', 'Musa', 'Okafor', 'Okoro', 'Olawale', 'Oluwaseun', 'Oni'];

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

function randomDateOfBirth() {
  const age = Math.floor(Math.random() * 14) + 5;
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

function randomAdmissionYear() {
  const year = new Date().getFullYear() - Math.floor(Math.random() * 5);
  return new Date(year, 8, 1).toISOString().split('T')[0];
}

async function seedStudents() {
  if (!AUTH_COOKIE && !authToken) {
    await login();
  }
  
  console.log('👨‍🎓 Creating Students...\n');
  
  // Fetch class arms
  const classArms = await apiCall('/api/class/arms');
  const arms = Array.isArray(classArms) ? classArms.slice(0, 5) : [];
  
  if (arms.length === 0) {
    console.log('⚠️  No class arms found! Create class arms first.\n');
    return;
  }
  
  let created = 0;
  let counter = 1;
  
  for (const arm of arms) {
    const classArmId = arm.id || arm.classArmId;
    if (!classArmId) continue;
    
    console.log(`Creating students for ${arm.armName || 'Class'}...`);
    
    for (let i = 0; i < 10; i++) {
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      const firstName = firstNames[gender.toLowerCase()][Math.floor(Math.random() * firstNames[gender.toLowerCase()].length)];
      const lastName = surnames[Math.floor(Math.random() * surnames.length)];
      const admissionNo = `ADM${String(counter).padStart(4, '0')}`;
      counter++;
      
      try {
        await apiCall('/api/student', 'POST', {
          admissionNo,
          firstName,
          lastName,
          dateOfBirth: randomDateOfBirth(),
          gender,
          religion: religions[Math.floor(Math.random() * religions.length)],
          address: addresses[Math.floor(Math.random() * addresses.length)],
          classArmId: classArmId,
          yearOfAdmission: randomAdmissionYear(),
        });
        console.log(`  ✅ ${firstName} ${lastName} (${admissionNo})`);
        created++;
      } catch (error) {
        console.log(`  ⚠️  ${admissionNo}: ${error.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }
  
  console.log(`\n✅ Created ${created} students\n`);
}

seedStudents().catch(console.error);


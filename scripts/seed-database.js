/**
 * Database Seeding Script
 * 
 * This script populates the database with sample data for:
 * - Class Levels (e.g., Primary 1, Primary 2, etc.)
 * - Class Arms (e.g., Primary 1A, Primary 1B, etc.)
 * - Subjects
 * - Students
 * - Parents
 * 
 * Usage: node scripts/seed-database.js
 * 
 * Note: Make sure you have logged in as admin first to get authentication token
 * Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables
 */

// Handle fetch for older Node.js versions
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error('Error: fetch is not available. Please install node-fetch: npm install node-fetch');
    process.exit(1);
  }
}

const API_BASE_URL = process.env.API_BASE_URL || 'https://ui-staff-school-backend.onrender.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@school.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Sample data
const classLevels = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'JSS 1', 'JSS 2', 'JSS 3',
  'SSS 1', 'SSS 2', 'SSS 3'
];

const classArms = ['A', 'B', 'C'];

const subjects = [
  'English Language',
  'Mathematics',
  'Basic Science',
  'Social Studies',
  'Nigerian Languages',
  'Cultural & Creative Arts',
  'Physical & Health Education',
  'Christian Religious Knowledge',
  'Islamic Religious Studies',
  'Practical Agriculture',
  'Home Economics',
  'French Language',
  'Computer Studies',
  'Music',
  'Business Studies',
  'Economics',
  'Government',
  'Literature in English',
  'Geography',
  'History',
  'Chemistry',
  'Physics',
  'Biology',
  'Further Mathematics'
];

// Nigerian first names
const firstNames = {
  male: ['Adebayo', 'Chukwuemeka', 'Emeka', 'Ibrahim', 'Musa', 'Oluwaseun', 'Tunde', 'Yusuf', 'Ahmad', 'Babatunde', 'Chinedu', 'Femi', 'Kolawole', 'Segun', 'Tolu'],
  female: ['Amina', 'Chioma', 'Fatima', 'Halima', 'Ifeoma', 'Ngozi', 'Oluwatoyin', 'Zainab', 'Adunni', 'Blessing', 'Chiamaka', 'Folake', 'Kemi', 'Nneka', 'Temi']
};

// Nigerian surnames
const surnames = ['Adebayo', 'Adekunle', 'Adewale', 'Afolabi', 'Akanbi', 'Bello', 'Chukwu', 'Eze', 'Ibrahim', 'Musa', 'Okafor', 'Okoro', 'Olawale', 'Oluwaseun', 'Oni', 'Oyedepo', 'Suleiman', 'Yusuf', 'Adeyemi', 'Babatunde', 'Chinedu', 'Falana', 'Igbokwe', 'Nwankwo', 'Obi', 'Ogundipe', 'Okafor', 'Okonkwo', 'Oluwafemi', 'Salami'];

// Addresses in Nigeria
const addresses = [
  '15 Ahmadu Bello Way, Victoria Island, Lagos',
  '42 Wuse Road, Wuse 2, Abuja',
  '28 Airport Road, Ikeja, Lagos',
  '10 Ring Road, Ibadan, Oyo State',
  '5 Independence Avenue, Enugu, Enugu State',
  '33 Aba Road, Port Harcourt, Rivers State',
  '12 Ahmadu Bello Way, Kaduna, Kaduna State',
  '8 Ahmadu Bello Way, Kano, Kano State',
  '20 Nnamdi Azikiwe Street, Onitsha, Anambra State',
  '7 Marina Road, Calabar, Cross River State',
  '25 Yakubu Gowon Way, Jos, Plateau State',
  '14 Ahmadu Bello Way, Maiduguri, Borno State',
  '30 Airport Road, Benin City, Edo State',
  '18 Ahmadu Bello Way, Sokoto, Sokoto State',
  '22 Ahmadu Bello Way, Yola, Adamawa State'
];

const religions = ['Christian', 'Muslim', 'Traditional'];
const parentRoles = ['Father', 'Mother', 'Guardian'];

// Helper function to get auth token
async function getAuthToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/authentication/login`, {
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
      const error = await response.text();
      throw new Error(`Login failed: ${error}`);
    }

    const data = await response.json();
    return data.access_token || data.token || data.accessToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Helper function to make authenticated API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    throw new Error(`API Error (${response.status}): ${errorData.error || errorData.message || errorText}`);
  }

  return response.json();
}

// Generate random date of birth (ages 5-18)
function randomDateOfBirth() {
  const age = Math.floor(Math.random() * 14) + 5; // 5-18 years old
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day).toISOString();
}

// Generate random admission year (last 5 years)
function randomAdmissionYear() {
  const currentYear = new Date().getFullYear();
  const year = currentYear - Math.floor(Math.random() * 5);
  return new Date(year, 8, 1).toISOString(); // September 1st
}

// Generate random phone number (Nigerian format)
function randomPhoneNumber() {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// Generate random email
function randomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Authenticate
    console.log('📝 Step 1: Authenticating...');
    const token = await getAuthToken();
    console.log('✅ Authentication successful\n');

    // Step 2: Create Class Levels
    console.log('📚 Step 2: Creating class levels...');
    const createdClassLevels = [];
    for (const className of classLevels) {
      try {
        const classLevel = await apiCall('/class/level', 'POST', { className }, token);
        createdClassLevels.push(classLevel);
        console.log(`  ✅ Created: ${className}`);
      } catch (error) {
        // If already exists, fetch it
        console.log(`  ⚠️  ${className} may already exist, skipping...`);
      }
    }
    console.log(`✅ Created ${createdClassLevels.length} class levels\n`);

    // Fetch all class levels to get IDs
    const allClassLevels = await apiCall('/class/level', 'GET', null, token);
    const classLevelsArray = Array.isArray(allClassLevels) ? allClassLevels : [];
    console.log(`📋 Found ${classLevelsArray.length} class levels\n`);

    // Step 3: Fetch Teachers (needed for class arms)
    console.log('👨‍🏫 Step 3a: Fetching teachers...');
    let teachers = [];
    try {
      const teachersData = await apiCall('/staff', 'GET', null, token);
      teachers = Array.isArray(teachersData) ? teachersData : [];
      console.log(`📋 Found ${teachers.length} teachers\n`);
    } catch (error) {
      console.log(`  ⚠️  Could not fetch teachers: ${error.message}`);
      console.log(`  ℹ️  Will use placeholder teacher ID\n`);
    }

    // Step 3b: Create Class Arms
    console.log('🏫 Step 3b: Creating class arms...');
    const createdClassArms = [];
    for (const classLevel of classLevelsArray) {
      const classLevelId = classLevel.id || classLevel.classLevelId;
      if (!classLevelId) continue;

      for (const arm of classArms) {
        try {
          // Use first available teacher or placeholder
          const teacherId = teachers.length > 0 
            ? (teachers[0].id || teachers[0].userId || '1')
            : '1';
          
          const classArm = await apiCall('/class/arms', 'POST', {
            armName: arm,
            classLevelId: classLevelId,
            teacherId: String(teacherId),
          }, token);
          createdClassArms.push(classArm);
          console.log(`  ✅ Created: ${classLevel.className}${arm}`);
        } catch (error) {
          console.log(`  ⚠️  ${classLevel.className}${arm} may already exist: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${createdClassArms.length} class arms\n`);

    // Fetch all class arms
    const allClassArms = await apiCall('/class/arms', 'GET', null, token);
    const classArmsArray = Array.isArray(allClassArms) ? allClassArms : [];
    console.log(`📋 Found ${classArmsArray.length} class arms\n`);

    // Step 4: Create Subjects
    console.log('📖 Step 4: Creating subjects...');
    const createdSubjects = [];
    for (const subjectName of subjects) {
      try {
        const subject = await apiCall('/subject', 'POST', { subjectName }, token);
        createdSubjects.push(subject);
        console.log(`  ✅ Created: ${subjectName}`);
      } catch (error) {
        console.log(`  ⚠️  ${subjectName} may already exist: ${error.message}`);
      }
    }
    console.log(`✅ Created ${createdSubjects.length} subjects\n`);

    // Step 5: Create Students
    console.log('👨‍🎓 Step 5: Creating students...');
    const createdStudents = [];
    const studentsPerClass = 15; // 15 students per class arm

    for (let i = 0; i < classArmsArray.length && i < 10; i++) {
      const classArm = classArmsArray[i];
      const classArmId = classArm.id || classArm.classArmId;

      for (let j = 0; j < studentsPerClass; j++) {
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const firstName = firstNames[gender.toLowerCase()][Math.floor(Math.random() * firstNames[gender.toLowerCase()].length)];
        const lastName = surnames[Math.floor(Math.random() * surnames.length)];
        const admissionNo = `ADM${String(createdStudents.length + 1).padStart(4, '0')}`;

        try {
          const student = await apiCall('/student', 'POST', {
            admissionNo,
            firstName,
            lastName,
            dateOfBirth: randomDateOfBirth(),
            gender,
            religion: religions[Math.floor(Math.random() * religions.length)],
            address: addresses[Math.floor(Math.random() * addresses.length)],
            classArmId: classArmId,
            yearOfAdmission: randomAdmissionYear(),
          }, token);
          createdStudents.push(student);
          console.log(`  ✅ Created: ${firstName} ${lastName} (${admissionNo})`);
        } catch (error) {
          console.log(`  ⚠️  Failed to create ${admissionNo}: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${createdStudents.length} students\n`);

    // Step 6: Create Parents
    console.log('👨‍👩‍👧 Step 6: Creating parents...');
    const createdParents = [];
    const parentsCount = Math.floor(createdStudents.length * 0.8); // 80% of students have parents

    for (let i = 0; i < parentsCount; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
      const lastName = surnames[Math.floor(Math.random() * surnames.length)];
      const fullName = `${firstName} ${lastName}`;
      const parentRole = gender === 'male' ? 'Father' : 'Mother';

      try {
        const parent = await apiCall('/parent', 'POST', {
          fullName,
          parentRole,
          religion: religions[Math.floor(Math.random() * religions.length)],
          email: randomEmail(firstName, lastName),
          phoneNumber: randomPhoneNumber(),
          address: addresses[Math.floor(Math.random() * addresses.length)],
          password: 'parent123', // Default password
        }, token);
        createdParents.push(parent);
        console.log(`  ✅ Created: ${fullName} (${parentRole})`);

        // Link parent to a random student (if students exist)
        if (createdStudents.length > 0 && Math.random() > 0.3) {
          const randomStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];
          try {
            await apiCall('/parent/link-student', 'POST', {
              parentId: parent.id,
              studentAdmissionNo: randomStudent.admissionNo || randomStudent.admissionNumber,
            }, token);
            console.log(`    🔗 Linked to student: ${randomStudent.firstName} ${randomStudent.lastName}`);
          } catch (linkError) {
            console.log(`    ⚠️  Failed to link student: ${linkError.message}`);
          }
        }
      } catch (error) {
        console.log(`  ⚠️  Failed to create parent ${fullName}: ${error.message}`);
      }
    }
    console.log(`✅ Created ${createdParents.length} parents\n`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ Class Levels: ${classLevelsArray.length}`);
    console.log(`  ✅ Class Arms: ${classArmsArray.length}`);
    console.log(`  ✅ Subjects: ${createdSubjects.length}`);
    console.log(`  ✅ Students: ${createdStudents.length}`);
    console.log(`  ✅ Parents: ${createdParents.length}`);
    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


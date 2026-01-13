/**
 * Simple Database Seeding Script
 * 
 * This script creates dummy data by calling the frontend API routes
 * which proxy to the backend. It works page by page.
 * 
 * Usage: 
 *   1. Start your Next.js dev server: npm run dev
 *   2. In another terminal: node scripts/seed-simple.js
 * 
 * Make sure you're logged in as admin in the browser first!
 */

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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

// Nigerian names
const firstNames = {
  male: ['Adebayo', 'Chukwuemeka', 'Emeka', 'Ibrahim', 'Musa', 'Oluwaseun', 'Tunde', 'Yusuf', 'Ahmad', 'Babatunde', 'Chinedu', 'Femi', 'Kolawole', 'Segun', 'Tolu'],
  female: ['Amina', 'Chioma', 'Fatima', 'Halima', 'Ifeoma', 'Ngozi', 'Oluwatoyin', 'Zainab', 'Adunni', 'Blessing', 'Chiamaka', 'Folake', 'Kemi', 'Nneka', 'Temi']
};

const surnames = ['Adebayo', 'Adekunle', 'Adewale', 'Afolabi', 'Akanbi', 'Bello', 'Chukwu', 'Eze', 'Ibrahim', 'Musa', 'Okafor', 'Okoro', 'Olawale', 'Oluwaseun', 'Oni', 'Oyedepo', 'Suleiman', 'Yusuf', 'Adeyemi', 'Babatunde', 'Chinedu', 'Falana', 'Igbokwe', 'Nwankwo', 'Obi', 'Ogundipe', 'Okafor', 'Okonkwo', 'Oluwafemi', 'Salami'];

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
  '7 Marina Road, Calabar, Cross River State'
];

const religions = ['Christian', 'Muslim', 'Traditional'];
const parentRoles = ['Father', 'Mother', 'Guardian'];

// Helper to get cookies from browser (you'll need to paste your cookie)
// Or we'll use a simpler approach - just make requests that will work with session
let authCookie = process.env.AUTH_COOKIE || '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
  };

  // Add cookie if available
  if (authCookie) {
    headers['Cookie'] = authCookie;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${FRONTEND_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }
    throw new Error(`API Error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Generate random date of birth (ages 5-18)
function randomDateOfBirth() {
  const age = Math.floor(Math.random() * 14) + 5;
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month - 1, day).toISOString().split('T')[0];
}

// Generate random admission year
function randomAdmissionYear() {
  const currentYear = new Date().getFullYear();
  const year = currentYear - Math.floor(Math.random() * 5);
  return new Date(year, 8, 1).toISOString().split('T')[0];
}

// Generate random phone number
function randomPhoneNumber() {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// Generate random email
function randomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting simple database seeding...\n');
  console.log('📝 NOTE: Make sure you are logged in as admin in your browser!\n');
  console.log('📝 NOTE: Your Next.js dev server should be running on', FRONTEND_URL, '\n');

  try {
    // Step 1: Create Class Levels
    console.log('📚 Step 1: Creating class levels...');
    const createdClassLevels = [];
    for (const className of classLevels) {
      try {
        const classLevel = await apiCall('/api/class/level', 'POST', { className });
        createdClassLevels.push(classLevel);
        console.log(`  ✅ Created: ${className}`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
      } catch (error) {
        console.log(`  ⚠️  ${className}: ${error.message}`);
      }
    }
    console.log(`✅ Processed ${classLevels.length} class levels\n`);

    // Step 2: Fetch class levels to get IDs
    console.log('📋 Step 2: Fetching class levels...');
    let allClassLevels = [];
    try {
      allClassLevels = await apiCall('/api/class/level', 'GET');
      allClassLevels = Array.isArray(allClassLevels) ? allClassLevels : [];
      console.log(`✅ Found ${allClassLevels.length} class levels\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch class levels: ${error.message}\n`);
    }

    // Step 3: Fetch teachers
    console.log('👨‍🏫 Step 3: Fetching teachers...');
    let teachers = [];
    try {
      const teachersData = await apiCall('/api/staff', 'GET');
      teachers = Array.isArray(teachersData) ? teachersData : [];
      console.log(`✅ Found ${teachers.length} teachers\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch teachers: ${error.message}\n`);
    }

    // Step 4: Create Class Arms
    console.log('🏫 Step 4: Creating class arms...');
    let createdClassArms = 0;
    for (const classLevel of allClassLevels) {
      const classLevelId = classLevel.id || classLevel.classLevelId;
      if (!classLevelId) continue;

      for (const arm of classArms) {
        try {
          const teacherId = teachers.length > 0 
            ? String(teachers[0].id || teachers[0].userId || '1')
            : '1';
          
          await apiCall('/api/class/arms', 'POST', {
            armName: arm,
            classLevelId: classLevelId,
            teacherId: teacherId,
          });
          createdClassArms++;
          console.log(`  ✅ Created: ${classLevel.className || 'Class'} ${arm}`);
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.log(`  ⚠️  ${classLevel.className}${arm}: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${createdClassArms} class arms\n`);

    // Step 5: Fetch class arms
    console.log('📋 Step 5: Fetching class arms...');
    let allClassArms = [];
    try {
      allClassArms = await apiCall('/api/class/arms', 'GET');
      allClassArms = Array.isArray(allClassArms) ? allClassArms : [];
      console.log(`✅ Found ${allClassArms.length} class arms\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch class arms: ${error.message}\n`);
    }

    // Step 6: Create Subjects
    console.log('📖 Step 6: Creating subjects...');
    let createdSubjects = 0;
    for (const subjectName of subjects) {
      try {
        await apiCall('/api/subject', 'POST', { subjectName });
        createdSubjects++;
        console.log(`  ✅ Created: ${subjectName}`);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ⚠️  ${subjectName}: ${error.message}`);
      }
    }
    console.log(`✅ Created ${createdSubjects} subjects\n`);

    // Step 7: Create Students
    console.log('👨‍🎓 Step 7: Creating students...');
    const studentsPerClass = 10; // Reduced for faster seeding
    let createdStudents = 0;
    let studentCounter = 1;

    // Limit to first 5 class arms for faster seeding
    const classArmsToUse = allClassArms.slice(0, 5);

    for (const classArm of classArmsToUse) {
      const classArmId = classArm.id || classArm.classArmId;
      if (!classArmId) continue;

      for (let j = 0; j < studentsPerClass; j++) {
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const firstName = firstNames[gender.toLowerCase()][Math.floor(Math.random() * firstNames[gender.toLowerCase()].length)];
        const lastName = surnames[Math.floor(Math.random() * surnames.length)];
        const admissionNo = `ADM${String(studentCounter).padStart(4, '0')}`;
        studentCounter++;

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
          createdStudents++;
          console.log(`  ✅ Created: ${firstName} ${lastName} (${admissionNo})`);
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log(`  ⚠️  Failed to create ${admissionNo}: ${error.message}`);
        }
      }
    }
    console.log(`✅ Created ${createdStudents} students\n`);

    // Step 8: Fetch students
    console.log('📋 Step 8: Fetching students...');
    let allStudents = [];
    try {
      allStudents = await apiCall('/api/student', 'GET');
      allStudents = Array.isArray(allStudents) ? allStudents : [];
      console.log(`✅ Found ${allStudents.length} students\n`);
    } catch (error) {
      console.log(`⚠️  Could not fetch students: ${error.message}\n`);
    }

    // Step 9: Create Parents
    console.log('👨‍👩‍👧 Step 9: Creating parents...');
    const parentsCount = Math.min(Math.floor(allStudents.length * 0.7), 30); // 70% of students, max 30
    let createdParents = 0;

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
        createdParents++;
        console.log(`  ✅ Created: ${fullName} (${parentRole})`);

        // Link parent to a random student
        if (allStudents.length > 0 && Math.random() > 0.3) {
          const randomStudent = allStudents[Math.floor(Math.random() * allStudents.length)];
          try {
            await apiCall('/api/parent/link-student', 'POST', {
              parentId: parent.id,
              studentAdmissionNo: randomStudent.admissionNo || randomStudent.admissionNumber,
            });
            console.log(`    🔗 Linked to: ${randomStudent.firstName} ${randomStudent.lastName}`);
          } catch (linkError) {
            // Silent fail for linking
          }
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`  ⚠️  Failed to create parent ${fullName}: ${error.message}`);
      }
    }
    console.log(`✅ Created ${createdParents} parents\n`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ Class Levels: ${allClassLevels.length}`);
    console.log(`  ✅ Class Arms: ${allClassArms.length}`);
    console.log(`  ✅ Subjects: ${createdSubjects}`);
    console.log(`  ✅ Students: ${createdStudents}`);
    console.log(`  ✅ Parents: ${createdParents}`);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n💡 Tip: Refresh your browser to see the new data!');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

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

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


/**
 * Seed All Data - Runs all seed scripts in order
 * Run: node scripts/seed-all.js
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runScript(script) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Running: ${script}`);
  console.log('='.repeat(50));
  
  try {
    const { stdout, stderr } = await execAsync(`node ${script}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error running ${script}:`, error.message);
  }
}

async function seedAll() {
  console.log('🌱 Starting complete database seeding...\n');
  console.log('Make sure your Next.js dev server is running!\n');
  
  const scripts = [
    'scripts/seed-classes.js',
    'scripts/seed-subjects.js',
    'scripts/seed-students.js',
    'scripts/seed-parents.js',
  ];
  
  for (const script of scripts) {
    await runScript(script);
    await new Promise(r => setTimeout(r, 1000)); // Wait between scripts
  }
  
  console.log('\n🎉 All seeding completed!\n');
}

seedAll().catch(console.error);


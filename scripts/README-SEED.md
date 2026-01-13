# Database Seeding Script

This script populates the database with comprehensive sample data for testing and development.

## What Gets Created

- **Class Levels**: Primary 1-6, JSS 1-3, SSS 1-3 (12 levels)
- **Class Arms**: A, B, C arms for each class level (36 arms total)
- **Subjects**: 24 subjects covering all academic areas
- **Students**: ~150 students distributed across different classes
- **Parents**: ~120 parents linked to students

## Prerequisites

1. Node.js 18+ (for native fetch support) OR install `node-fetch`:
   ```bash
   npm install node-fetch
   ```

2. Admin credentials:
   - Email: `admin@school.com` (default)
   - Password: `admin123` (default)

3. Backend API must be running and accessible

## Usage

### Option 1: Using Environment Variables

```bash
# Set environment variables
export API_BASE_URL=https://ui-staff-school-backend.onrender.com
export ADMIN_EMAIL=admin@school.com
export ADMIN_PASSWORD=admin123

# Run the script
node scripts/seed-database.js
```

### Option 2: Direct Execution

```bash
node scripts/seed-database.js
```

The script will use default values:
- API_BASE_URL: `https://ui-staff-school-backend.onrender.com`
- ADMIN_EMAIL: `admin@school.com`
- ADMIN_PASSWORD: `admin123`

### Option 3: Using npm script (if added to package.json)

```bash
npm run seed
```

## Sample Data Details

### Class Levels
- Primary 1 through Primary 6
- JSS 1 through JSS 3
- SSS 1 through SSS 3

### Class Arms
Each class level gets 3 arms (A, B, C)

### Subjects
- Core subjects: English, Mathematics, Basic Science, Social Studies
- Languages: Nigerian Languages, French Language
- Arts: Cultural & Creative Arts, Music
- Religious Studies: CRK, IRS
- Practical: Agriculture, Home Economics, Computer Studies
- Senior subjects: Business Studies, Economics, Government, Literature, Geography, History, Chemistry, Physics, Biology, Further Mathematics

### Students
- Nigerian names (first and last)
- Ages 5-18
- Distributed across all class arms
- Admission numbers: ADM0001, ADM0002, etc.
- Random addresses in Nigerian cities
- Mixed religions (Christian, Muslim, Traditional)

### Parents
- Linked to 80% of students
- Nigerian names matching student surnames
- Valid Nigerian phone numbers
- Email addresses
- Addresses in Nigerian cities

## Notes

- The script handles existing data gracefully (won't duplicate)
- If a record already exists, it will skip and continue
- Parent-student linking is randomized
- All passwords for parents are set to `parent123` (change after seeding)

## Troubleshooting

1. **Authentication fails**: 
   - Verify admin credentials
   - Check if backend is running
   - Ensure API_BASE_URL is correct

2. **Fetch not found**:
   - Upgrade to Node.js 18+ OR
   - Install node-fetch: `npm install node-fetch`
   - Add to script: `const fetch = require('node-fetch');`

3. **API errors**:
   - Check backend logs
   - Verify API endpoints are correct
   - Ensure backend database is accessible

## Customization

Edit `scripts/seed-database.js` to:
- Change number of students per class
- Modify class levels or arms
- Add/remove subjects
- Adjust parent-student ratio
- Change default passwords


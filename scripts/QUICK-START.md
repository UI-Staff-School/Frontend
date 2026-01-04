# Quick Start: Database Seeding

## Fastest Way to Seed Database

1. **Make sure you're logged in as admin** in the application
   - Email: `admin@school.com`
   - Password: `admin123`

2. **Run the seed script**:
   ```bash
   npm run seed
   ```

   OR directly:
   ```bash
   node scripts/seed-database.js
   ```

3. **Wait for completion** - The script will create:
   - 12 Class Levels
   - 36 Class Arms (3 per level)
   - 24 Subjects
   - ~150 Students
   - ~120 Parents

## What You'll See

The script will output progress like:
```
🌱 Starting database seeding...

📝 Step 1: Authenticating...
✅ Authentication successful

📚 Step 2: Creating class levels...
  ✅ Created: Primary 1
  ✅ Created: Primary 2
  ...

🏫 Step 3: Creating class arms...
  ✅ Created: Primary 1A
  ...

📖 Step 4: Creating subjects...
  ✅ Created: English Language
  ...

👨‍🎓 Step 5: Creating students...
  ✅ Created: Adebayo Akanbi (ADM0001)
  ...

👨‍👩‍👧 Step 6: Creating parents...
  ✅ Created: Adebayo Akanbi (Father)
  ...

📊 Seeding Summary:
  ✅ Class Levels: 12
  ✅ Class Arms: 36
  ✅ Subjects: 24
  ✅ Students: 150
  ✅ Parents: 120

🎉 Database seeding completed successfully!
```

## Troubleshooting

**"fetch is not available"**
- Install node-fetch: `npm install node-fetch`
- OR upgrade Node.js to version 18+

**"Authentication failed"**
- Check admin credentials
- Make sure backend is running
- Verify API_BASE_URL is correct

**"API Error"**
- Check backend logs
- Verify backend is accessible
- Check network connection

## Customization

Edit `scripts/seed-database.js` to change:
- Number of students per class
- Which class levels to create
- Which subjects to add
- Parent-student linking ratio


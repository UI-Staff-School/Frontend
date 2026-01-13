# Simple Database Seeding Instructions

## Quick Start

This script creates dummy data by calling your frontend API routes (which proxy to the backend).

### Step 1: Start Your Dev Server

```bash
npm run dev
```

Make sure it's running on `http://localhost:3000` (or update `FRONTEND_URL` in the script).

### Step 2: Login as Admin

1. Open your browser and go to `http://localhost:3000`
2. Login as admin:
   - Email: `admin@school.com`
   - Password: `admin123`
   - Role: `Admin`

### Step 3: Get Your Cookie (Optional but Recommended)

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find Cookies → `http://localhost:3000`
4. Copy the `access_token` or `token` cookie value
5. Set it as environment variable:
   ```bash
   export AUTH_COOKIE="access_token=YOUR_TOKEN_HERE"
   ```

   OR on Windows:
   ```cmd
   set AUTH_COOKIE=access_token=YOUR_TOKEN_HERE
   ```

### Step 4: Run the Seed Script

In a **new terminal** (keep dev server running):

```bash
npm run seed
```

OR:

```bash
node scripts/seed-simple.js
```

## What Gets Created

- **12 Class Levels**: Primary 1-6, JSS 1-3, SSS 1-3
- **36 Class Arms**: A, B, C for each level (if teachers exist)
- **24 Subjects**: All academic subjects
- **~50 Students**: Distributed across first 5 class arms
- **~30 Parents**: Linked to students

## Troubleshooting

### "API Error 401: Unauthorized"
- Make sure you're logged in as admin in the browser
- Try copying your cookie and setting `AUTH_COOKIE` environment variable
- The script uses cookies from your browser session

### "ECONNREFUSED" or "Cannot connect"
- Make sure your Next.js dev server is running
- Check that it's on `http://localhost:3000`
- Or set `FRONTEND_URL` environment variable:
  ```bash
  FRONTEND_URL=http://localhost:3000 npm run seed
  ```

### "fetch is not available"
- Install node-fetch: `npm install node-fetch`
- OR upgrade to Node.js 18+

### Some items fail to create
- This is normal! The script continues even if some items already exist
- Check the console output to see what was created successfully

## Alternative: Manual Seeding via Browser

If the script doesn't work, you can manually create data:

1. **Class Levels**: Go to `/list/classes` → Create class levels
2. **Class Arms**: Go to `/list/classes` → Create class arms for each level
3. **Subjects**: Go to `/list/subjects` → Create subjects
4. **Students**: Go to `/list/students` → Create students
5. **Parents**: Go to `/list/parents` → Create parents

## Customization

Edit `scripts/seed-simple.js` to:
- Change number of students per class
- Modify which class levels to create
- Adjust parent-student ratio
- Change the delay between requests


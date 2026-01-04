# Authentication for Seed Scripts

The seed scripts need authentication to work. Here are your options:

## Option 1: Automatic Login (Recommended)

The scripts will automatically login using these credentials:
- Email: `admin@school.com` (default)
- Password: `admin123` (default)

Just run:
```bash
npm run seed
```

To use different credentials:
```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npm run seed
```

## Option 2: Use Browser Cookie

If automatic login doesn't work, you can copy your browser cookie:

1. **Login to the app** in your browser (http://localhost:3000)
2. **Open DevTools** (F12)
3. **Go to Application/Storage** → Cookies → `http://localhost:3000`
4. **Find** `access_token` or `token` cookie
5. **Copy the full cookie string**, e.g.: `access_token=eyJhbGc...`

Then run:
```bash
# Windows
set AUTH_COOKIE=access_token=YOUR_TOKEN_HERE
npm run seed

# Linux/Mac
export AUTH_COOKIE="access_token=YOUR_TOKEN_HERE"
npm run seed
```

## Option 3: Check Backend URL

If login fails, make sure the backend URL is correct:

```bash
BACKEND_URL=https://ui-staff-school-backend.onrender.com npm run seed
```

## Troubleshooting

### "Login failed: 404"
- Check that `BACKEND_URL` is correct
- Make sure backend is accessible

### "Login failed: 401"
- Check admin credentials
- Verify admin user exists in database

### "Unauthorized" errors after login
- Token might be expired, try logging in again
- Check that token is being passed correctly

### Still not working?
- Try copying cookie from browser (Option 2)
- Check browser console for any errors
- Verify you can manually create items in the UI


# Result Management System

A comprehensive result management system built with Next.js, TypeScript, Prisma, and CSS modules.

## Features

- **Role-based Access Control**: Admin, Teacher, and Student roles with different permissions
- **Result Entry**: Teachers can add and edit student results
- **Headmaster Comments**: Admin can add headmaster comments to results
- **Student View**: Students can view their own results (read-only)
- **Filtering**: Filter results by student, term, and other criteria
- **Responsive Design**: Clean, modern UI with CSS modules

## Database Schema

The system uses Prisma with PostgreSQL and includes the following models:

- **User**: Authentication and role management
- **Student**: Student profiles and information
- **Teacher**: Teacher profiles
- **Subject**: Available subjects
- **Term**: Academic terms
- **Result**: Student results with CA and exam scores
- **Attendance**: Student attendance records

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Copy `.env.example` to `.env` and update the database URL
3. Run Prisma migrations:

```bash
npx prisma db push
npx prisma generate
```

### 3. Seed the Database

```bash
npm run db:seed
```

This will create:

- Default subjects for primary school
- Sample terms (First, Second, Third Term 2024/2025)
- Admin user (admin@school.com / admin123)
- Teacher user (teacher@school.com / teacher123)
- Student user (student@school.com / student123)
- Sample students

### 4. Start the Development Server

```bash
npm run dev
```

## User Roles and Permissions

### Admin (Headmaster)

- View all results
- Add headmaster comments to any result
- Manage all aspects of the system

### Teacher

- Add new results
- Edit existing results (except headmaster comments)
- View all students and their results
- Filter results by student and term

### Student

- View only their own results
- Read-only access
- Cannot edit or add results

## API Endpoints

### Results

- `GET /api/results` - Get results (with optional filtering)
- `POST /api/results` - Create new result (Teacher/Admin only)
- `PUT /api/results/[id]` - Update result (Teacher/Admin only)
- `GET /api/results/[id]` - Get specific result
- `PUT /api/results/[id]/headmaster` - Add headmaster comment (Admin only)

### Supporting Data

- `GET /api/students` - Get all students
- `GET /api/subjects` - Get all subjects
- `GET /api/terms` - Get all terms
- `GET /api/auth/me` - Get current user info

## Pages

### Results Management (`/list/results`)

- Main results page with filtering
- Shows results table with student, subject, scores, and comments
- Role-based display (shows different columns based on user role)

### Add Result (`/list/results/add`)

- Form to add new results
- Teacher/Admin only
- Includes validation for CA (0-30) and Exam (0-70) scores

### Edit Result (`/list/results/edit/[id]`)

- Form to edit existing results
- Teacher/Admin only
- Pre-populated with current values

### Headmaster Comment (`/list/results/headmaster/[id]`)

- Form to add headmaster comments
- Admin only
- Shows result details for context

## Components

### ResultTable

- Displays results in a clean table format
- Configurable columns based on user role
- Action buttons for editing (when permitted)

### ResultForm

- Form for adding/editing results
- Includes validation and error handling
- Dropdowns for student, subject, and term selection

### Protected

- Higher-order component for role-based access control
- Shows loading state or unauthorized message

### HeadmasterCommentForm

- Simple form for adding headmaster comments
- Admin-only access

## Styling

The system uses CSS modules for styling:

- `src/styles/Result.module.css` - Main styles for result management
- Clean, modern design with hover effects
- Responsive layout
- Consistent color scheme and typography

## Security Features

- JWT-based authentication
- Role-based access control on both frontend and backend
- Server-side validation for all API endpoints
- Input validation and sanitization
- Secure password hashing with bcrypt

## Testing Checklist

### Functional Tests

- [ ] Teacher can create a result
- [ ] Teacher can edit existing results
- [ ] Admin can add headmaster comments
- [ ] Student can view only their results
- [ ] Results are properly filtered by student/term
- [ ] Total score is calculated correctly (CA + Exam)

### Validation Tests

- [ ] CA score validation (0-30)
- [ ] Exam score validation (0-70)
- [ ] Required field validation
- [ ] Duplicate result prevention

### Security Tests

- [ ] Unauthorized access is blocked
- [ ] Role-based permissions work correctly
- [ ] API endpoints validate user roles
- [ ] JWT tokens are properly validated

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"
JWT_SECRET="your-super-secret-jwt-key"
RESULT_API_BASE_URL="https://ui-staff-school-backend.onrender.com"
NEXT_PUBLIC_ATTENDANCE_SUMMARY_STUDENT_ID="STU-0001"
NEXT_PUBLIC_ATTENDANCE_SUMMARY_TERM_ID="TERM-0001"
```

- `RESULT_API_BASE_URL` points to the Render-hosted backend that now serves
  sessions, attendance, and result data.
- `NEXT_PUBLIC_ATTENDANCE_SUMMARY_STUDENT_ID` / `TERM_ID` control the defaults
  used by the dashboard attendance chart when fetching live summaries.

## Deployment

1. Set up production database
2. Update environment variables
3. Run database migrations
4. Build and deploy the application

```bash
npm run build
npm start
```

## Future Enhancements

- PDF export functionality
- Bulk result entry
- Grade calculation and ranking
- Parent portal integration
- Email notifications
- Advanced reporting and analytics


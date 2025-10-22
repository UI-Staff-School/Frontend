import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create subjects for primary school
  const subjects = [
    "English Lang.",
    "Mathematics",
    "Science",
    "Social Studies",
    "Nigerian Lang.",
    "Cultural & Creative Arts",
    "Physical & Health Educ.",
    "Christian Rel. Knowledge",
    "Islamic Rel. Studies",
    "Practical Agriculture",
    "Home Economics",
    "French Lang.",
    "Computer Studies",
    "Music",
  ];

  console.log("Creating subjects...");
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, maxScore: 100 },
    });
  }

  // Create sample terms
  console.log("Creating terms...");
  const terms = [
    { name: "First Term", year: "2024/2025" },
    { name: "Second Term", year: "2024/2025" },
    { name: "Third Term", year: "2024/2025" },
  ];

  for (const term of terms) {
    await prisma.term.upsert({
      where: { name_year: { name: term.name, year: term.year } },
      update: {},
      create: term,
    });
  }

  // Create sample admin user
  console.log("Creating admin user...");
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      name: "School Administrator",
      role: "ADMIN",
      password: hashedPassword,
    },
  });

  // Create sample teacher user
  console.log("Creating teacher user...");
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      email: "teacher@school.com",
      name: "John Teacher",
      role: "TEACHER",
      password: teacherPassword,
    },
  });

  // Create teacher profile
  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
    },
  });

  // Create sample student user
  console.log("Creating student user...");
  const studentPassword = await bcrypt.hash("student123", 10);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@school.com" },
    update: {},
    create: {
      email: "student@school.com",
      name: "Jane Student",
      role: "STUDENT",
      password: studentPassword,
    },
  });

  // Create student profile
  await prisma.student.upsert({
    where: { matric: "STU001" },
    update: {},
    create: {
      matric: "STU001",
      surname: "Student",
      firstname: "Jane",
      othername: "Mary",
      className: "Primary 5",
      userId: studentUser.id,
    },
  });

  // Create sample students
  console.log("Creating sample students...");
  const sampleStudents = [
    {
      matric: "STU002",
      surname: "Smith",
      firstname: "John",
      othername: "David",
      className: "Primary 4",
    },
    {
      matric: "STU003",
      surname: "Johnson",
      firstname: "Sarah",
      othername: "Grace",
      className: "Primary 5",
    },
    {
      matric: "STU004",
      surname: "Brown",
      firstname: "Michael",
      othername: "James",
      className: "Primary 6",
    },
    {
      matric: "STU005",
      surname: "Davis",
      firstname: "Emily",
      othername: "Rose",
      className: "Primary 4",
    },
    {
      matric: "STU006",
      surname: "Wilson",
      firstname: "David",
      othername: "Paul",
      className: "Primary 5",
    },
  ];

  for (const student of sampleStudents) {
    await prisma.student.upsert({
      where: { matric: student.matric },
      update: {},
      create: student,
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


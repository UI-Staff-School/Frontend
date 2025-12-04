import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  // TEMPORARILY COMMENTED OUT FOR DEVELOPMENT - Authorization checks disabled
  // const user = await getUserFromRequest(req);
  // if (!user)
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // requireRole(user, ["TEACHER", "ADMIN"]);
    const body = await req.json();
    const { studentId, subjectId, termId, continuous, summary } = body;
    const total = Number(continuous) + Number(summary);

    const result = await prisma.result.create({
      data: {
        studentId,
        subjectId,
        termId,
        continuous,
        summary,
        total,
        // teacherId: user.id, // TEMPORARILY COMMENTED OUT - using null or default for development
        teacherId: null, // TODO: Re-enable user.id when re-enabling auth
      },
    });
    return NextResponse.json({ result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  // TEMPORARILY COMMENTED OUT FOR DEVELOPMENT - Authorization checks disabled
  // const user = await getUserFromRequest(req);
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const termId = url.searchParams.get("termId");
  const className = url.searchParams.get("className");

  // Admin: can view all; teacher: we may filter to their students; student: only own
  const where: any = {};
  if (studentId) where.studentId = Number(studentId);
  if (termId) where.termId = Number(termId);

  // TEMPORARILY COMMENTED OUT FOR DEVELOPMENT - Student restriction disabled
  // If user is student restrict to their studentId (you must link user->student)
  // if (user && user.role === "STUDENT") {
  //   const student = await prisma.student.findUnique({
  //     where: { userId: user.id },
  //   });
  //   if (!student)
  //     return NextResponse.json(
  //       { error: "Student profile missing" },
  //       { status: 403 }
  //     );
  //   where.studentId = student.id;
  // }

  const results = await prisma.result.findMany({
    where,
    include: {
      student: true,
      subject: true,
      teacher: { select: { name: true } },
    },
    orderBy: { subjectId: "asc" },
  });

  return NextResponse.json({ results });
}


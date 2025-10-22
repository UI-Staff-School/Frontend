import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requireRole(user, ["ADMIN", "TEACHER"]);

    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { className: "asc" },
    });

    return NextResponse.json({ students });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}


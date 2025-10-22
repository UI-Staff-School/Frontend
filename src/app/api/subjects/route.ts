import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}


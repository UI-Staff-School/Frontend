import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requireRole } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    requireRole(user, ["ADMIN"]); // only admin (headmaster)
    const { headmasterComment } = await req.json();
    const updated = await prisma.result.update({
      where: { id: Number(params.id) },
      data: {
        /* store headmaster comments on result for demonstration */ comments:
          headmasterComment,
      },
    });
    return NextResponse.json({ updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}


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
    requireRole(user, ["TEACHER", "ADMIN"]);
    const body = await req.json();
    const id = Number(params.id);
    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Teachers can edit all but headmaster comment (we store headmaster comment in a different field)
    const updated = await prisma.result.update({
      where: { id },
      data: {
        continuous: body.continuous ?? existing.continuous,
        summary: body.summary ?? existing.summary,
        total:
          (body.continuous ?? existing.continuous) +
          (body.summary ?? existing.summary),
        comments: body.comments ?? existing.comments,
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = Number(params.id);
    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: true,
        subject: true,
        teacher: { select: { name: true } },
      },
    });

    if (!result)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    requireRole(user, ["TEACHER", "ADMIN"]);
    const id = Number(params.id);

    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.result.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Result deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth";

// 24 hour cooldown between password changes
const PASSWORD_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const userFromToken = await getUserFromRequest(req);

    if (!userFromToken || !userFromToken.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: userFromToken.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Enforce cooldown using passwordChangedAt timestamp if available
    if (user.passwordChangedAt) {
      const lastChanged = new Date(user.passwordChangedAt).getTime();
      const now = Date.now();
      const elapsed = now - lastChanged;

      if (elapsed < PASSWORD_CHANGE_COOLDOWN_MS) {
        const remainingMs = PASSWORD_CHANGE_COOLDOWN_MS - elapsed;
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

        return NextResponse.json(
          {
            error:
              "Password was changed recently. Please wait before changing it again.",
            remainingHours,
          },
          { status: 429 }
        );
      }
    }

    const isValidCurrent = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidCurrent) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordChangedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}



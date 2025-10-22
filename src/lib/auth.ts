import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export type AuthUser = {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
};

export async function getUserFromRequest(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    // Prefer Authorization header from external system; fallback to cookie
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const token = bearerToken || req.cookies.get("token")?.value;
    if (!token) return null;

    // Try to verify token with our JWT secret first (for internal tokens)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) return null;
      return { id: user.id, email: user.email, role: user.role };
    } catch (jwtError) {
      // If JWT verification fails, try to validate with external API
      try {
        const response = await fetch(
          "https://ui-staff-school-backend.onrender.com/authentication/validate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          // Map external user data to our AuthUser format
          return {
            id: userData.id || 1,
            email: userData.email || userData.username,
            name: userData.name || userData.fullName,
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            role:
              userData.role === "Admin"
                ? "ADMIN"
                : userData.role === "Teacher"
                ? "TEACHER"
                : userData.role === "Student"
                ? "STUDENT"
                : "ADMIN",
          };
        }
      } catch (apiError) {
        // If external API validation fails, return null
        return null;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

export function requireRole(user: AuthUser | null, allowed: string[]) {
  if (!user) throw new Error("Unauthorized");
  if (!allowed.includes(user.role)) throw new Error("Forbidden");
  return true;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

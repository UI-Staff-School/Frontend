import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

export const dynamic = "force-dynamic";

interface AnalyticsData {
  counts: {
    students: number;
    teachers: number;
    parents: number;
    staff: number;
    alumni: number;
  };
  studentsByGender: {
    male: number;
    female: number;
    total: number;
  };
  activeSession: {
    id: string | number;
    name: string;
    activeTerm?: {
      id: string | number;
      name: string;
    };
  } | null;
  paymentSummary: {
    totalCollected: number;
    totalPending: number;
    recentPayments: number;
  };
  alumniStats: {
    total: number;
    bySession: Array<{
      sessionId: string | number;
      sessionName: string;
      count: number;
    }>;
  } | null;
}

async function fetchWithAuth(url: string, req: NextRequest) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    // Fetch all data in parallel
    const [
      studentsData,
      staffData,
      parentsData,
      sessionsData,
      alumniStatsData,
      paymentsData,
    ] = await Promise.all([
      fetchWithAuth(buildExternalApiUrl("/student"), req),
      fetchWithAuth(buildExternalApiUrl("/staff"), req),
      fetchWithAuth(buildExternalApiUrl("/parent"), req),
      fetchWithAuth(buildExternalApiUrl("/session"), req),
      fetchWithAuth(buildExternalApiUrl("/alumni/statistics"), req),
      fetchWithAuth(buildExternalApiUrl("/payment"), req),
    ]);

    // Process students
    const students = Array.isArray(studentsData)
      ? studentsData
      : Array.isArray(studentsData?.data)
      ? studentsData.data
      : Array.isArray(studentsData?.students)
      ? studentsData.students
      : [];

    const maleStudents = students.filter(
      (s: any) => s.gender?.toLowerCase() === "male"
    ).length;
    const femaleStudents = students.filter(
      (s: any) => s.gender?.toLowerCase() === "female"
    ).length;

    // Process staff (separate teachers from other staff)
    const staffList = Array.isArray(staffData)
      ? staffData
      : Array.isArray(staffData?.data)
      ? staffData.data
      : Array.isArray(staffData?.staff)
      ? staffData.staff
      : [];

    const teachers = staffList.filter(
      (s: any) => s.role?.toLowerCase() === "teacher"
    ).length;
    const otherStaff = staffList.length - teachers;

    // Process parents
    const parents = Array.isArray(parentsData)
      ? parentsData
      : Array.isArray(parentsData?.data)
      ? parentsData.data
      : Array.isArray(parentsData?.parents)
      ? parentsData.parents
      : [];

    // Process sessions
    const sessions = Array.isArray(sessionsData)
      ? sessionsData
      : Array.isArray(sessionsData?.data)
      ? sessionsData.data
      : Array.isArray(sessionsData?.sessions)
      ? sessionsData.sessions
      : [];

    const activeSession = sessions.find((s: any) => s.isActive);
    let activeTerm = null;
    if (activeSession?.terms) {
      activeTerm = activeSession.terms.find((t: any) => t.isActive);
    }

    // Process payments
    const payments = Array.isArray(paymentsData)
      ? paymentsData
      : Array.isArray(paymentsData?.data)
      ? paymentsData.data
      : Array.isArray(paymentsData?.payments)
      ? paymentsData.payments
      : [];

    const successfulPayments = payments.filter(
      (p: any) =>
        p.status?.toLowerCase() === "success" ||
        p.status?.toLowerCase() === "completed"
    );
    const totalCollected = successfulPayments.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );

    const pendingPayments = payments.filter(
      (p: any) => p.status?.toLowerCase() === "pending"
    );
    const totalPending = pendingPayments.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );

    // Count recent payments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPayments = successfulPayments.filter((p: any) => {
      const paymentDate = new Date(p.paidAt || p.createdAt);
      return paymentDate >= thirtyDaysAgo;
    }).length;

    // Process alumni stats
    let alumniStats = null;
    if (alumniStatsData) {
      alumniStats = {
        total: alumniStatsData.total || alumniStatsData.totalAlumni || 0,
        bySession: alumniStatsData.bySession || alumniStatsData.sessions || [],
      };
    }

    const analytics: AnalyticsData = {
      counts: {
        students: students.length,
        teachers: teachers || staffList.length,
        parents: parents.length,
        staff: otherStaff || staffList.length,
        alumni: alumniStats?.total || 0,
      },
      studentsByGender: {
        male: maleStudents,
        female: femaleStudents,
        total: students.length,
      },
      activeSession: activeSession
        ? {
            id: activeSession.id,
            name: activeSession.name,
            activeTerm: activeTerm
              ? {
                  id: activeTerm.id,
                  name: activeTerm.name,
                }
              : undefined,
          }
        : null,
      paymentSummary: {
        totalCollected,
        totalPending,
        recentPayments,
      },
      alumniStats,
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

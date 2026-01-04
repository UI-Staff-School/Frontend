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
  attendanceSummary: {
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: number;
    weeklyData: Array<{
      day: string;
      present: number;
      absent: number;
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
      attendanceData,
    ] = await Promise.all([
      fetchWithAuth(buildExternalApiUrl("/student"), req),
      fetchWithAuth(buildExternalApiUrl("/staff"), req),
      fetchWithAuth(buildExternalApiUrl("/parent"), req),
      fetchWithAuth(buildExternalApiUrl("/session"), req),
      fetchWithAuth(buildExternalApiUrl("/alumni/statistics"), req),
      fetchWithAuth(buildExternalApiUrl("/payment"), req),
      fetchWithAuth(buildExternalApiUrl("/attendance"), req),
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

    // Process attendance data
    let attendanceSummary = null;
    const attendanceRecords = Array.isArray(attendanceData)
      ? attendanceData
      : Array.isArray(attendanceData?.data)
      ? attendanceData.data
      : Array.isArray(attendanceData?.attendance)
      ? attendanceData.attendance
      : [];

    if (attendanceRecords.length > 0) {
      // Get last 7 days of data
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Filter recent attendance records
      const recentRecords = attendanceRecords.filter((record: any) => {
        const recordDate = new Date(record.date || record.attendanceDate || record.createdAt);
        return recordDate >= sevenDaysAgo;
      });

      // Count present and absent
      const totalPresent = recentRecords.filter((r: any) =>
        r.status?.toLowerCase() === "present" || r.isPresent === true
      ).length;
      const totalAbsent = recentRecords.filter((r: any) =>
        r.status?.toLowerCase() === "absent" || r.isPresent === false
      ).length;

      // Calculate attendance rate
      const totalRecords = totalPresent + totalAbsent;
      const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

      // Group by day of week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyData: { [key: string]: { present: number; absent: number } } = {};

      // Initialize all days
      dayNames.forEach(day => {
        weeklyData[day] = { present: 0, absent: 0 };
      });

      // Populate with actual data
      recentRecords.forEach((record: any) => {
        const recordDate = new Date(record.date || record.attendanceDate || record.createdAt);
        const dayName = dayNames[recordDate.getDay()];
        if (record.status?.toLowerCase() === "present" || record.isPresent === true) {
          weeklyData[dayName].present++;
        } else {
          weeklyData[dayName].absent++;
        }
      });

      // Convert to array format (Mon-Fri for school week)
      const schoolDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const weeklyDataArray = schoolDays.map(day => ({
        day,
        present: weeklyData[day]?.present || 0,
        absent: weeklyData[day]?.absent || 0,
      }));

      attendanceSummary = {
        totalPresent,
        totalAbsent,
        attendanceRate,
        weeklyData: weeklyDataArray,
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
      attendanceSummary,
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

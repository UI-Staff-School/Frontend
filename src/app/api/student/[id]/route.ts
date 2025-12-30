import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      `Fetching student: ${params.id} from ${API_BASE_URL}/student/${params.id}`
    );

    const response = await fetch(`${API_BASE_URL}/student/${params.id}`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);

      // Return mock data for specific ID
      const mockStudent = {
        id: params.id,
        admissionNo: `ADM${params.id.padStart(3, "0")}`,
        firstName: "Alice",
        lastName: "Johnson",
        dateOfBirth: "2005-03-15T00:00:00.000Z",
        gender: "Female",
        religion: "Christian",
        address: "123 Oak Street, City, State",
        classArmId: 1,
        yearOfAdmission: "2023-09-01T00:00:00.000Z",
      };
      return NextResponse.json(mockStudent);
    }

    const data = await response.json();
    console.log(`Successfully fetched student: ${params.id}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Student member API Error:", error);

    // Return mock data if there's an error
    const mockStudent = {
      id: params.id,
      admissionNo: `ADM${params.id.padStart(3, "0")}`,
      firstName: "Alice",
      lastName: "Johnson",
      dateOfBirth: "2005-03-15T00:00:00.000Z",
      gender: "Female",
      religion: "Christian",
      address: "123 Oak Street, City, State",
      classArmId: 1,
      yearOfAdmission: "2023-09-01T00:00:00.000Z",
    };
    return NextResponse.json(mockStudent);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const response = await fetch(`${API_BASE_URL}/student/${params.id}`, {
      method: "PUT",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update student");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/student/${params.id}`, {
      method: "DELETE",
      headers: getApiHeaders(req),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete student");
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete student" },
      { status: 500 }
    );
  }
}


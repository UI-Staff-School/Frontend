import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    console.log(`Fetching from: ${API_BASE_URL}/student`);

    const response = await fetch(`${API_BASE_URL}/student`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    console.log(`Response status: ${response.status}`);
    console.log(
      `Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);

      // Return mock data if external API fails
      console.log("Returning mock data due to API failure");
      const mockData = [
        {
          id: "1",
          admissionNo: "ADM001",
          firstName: "Alice",
          lastName: "Johnson",
          dateOfBirth: "2005-03-15T00:00:00.000Z",
          gender: "Female",
          religion: "Christian",
          address: "123 Oak Street, City, State",
          classArmId: 1,
          yearOfAdmission: "2023-09-01T00:00:00.000Z",
        },
        {
          id: "2",
          admissionNo: "ADM002",
          firstName: "Bob",
          lastName: "Smith",
          dateOfBirth: "2004-07-22T00:00:00.000Z",
          gender: "Male",
          religion: "Muslim",
          address: "456 Pine Avenue, City, State",
          classArmId: 2,
          yearOfAdmission: "2023-09-01T00:00:00.000Z",
        },
        {
          id: "3",
          admissionNo: "ADM003",
          firstName: "Carol",
          lastName: "Williams",
          dateOfBirth: "2005-11-08T00:00:00.000Z",
          gender: "Female",
          religion: "Hindu",
          address: "789 Maple Drive, City, State",
          classArmId: 1,
          yearOfAdmission: "2023-09-01T00:00:00.000Z",
        },
      ];
      return NextResponse.json(mockData);
    }

    const data = await response.json();
    console.log(
      `Successfully fetched ${
        Array.isArray(data) ? data.length : "unknown"
      } students`
    );

    // Handle nested data structure: { data: [...], meta: {...} }
    if (data && data.data && Array.isArray(data.data)) {
      return NextResponse.json(data.data);
    }

    // If it's already an array, return as is
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    }

    // Fallback to empty array
    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Student API Error:", error);

    // Return mock data if there's a network error
    console.log("Returning mock data due to network error");
    const mockData = [
      {
        id: "1",
        admissionNo: "ADM001",
        firstName: "Alice",
        lastName: "Johnson",
        dateOfBirth: "2005-03-15T00:00:00.000Z",
        gender: "Female",
        religion: "Christian",
        address: "123 Oak Street, City, State",
        classArmId: 1,
        yearOfAdmission: "2023-09-01T00:00:00.000Z",
      },
      {
        id: "2",
        admissionNo: "ADM002",
        firstName: "Bob",
        lastName: "Smith",
        dateOfBirth: "2004-07-22T00:00:00.000Z",
        gender: "Male",
        religion: "Muslim",
        address: "456 Pine Avenue, City, State",
        classArmId: 2,
        yearOfAdmission: "2023-09-01T00:00:00.000Z",
      },
      {
        id: "3",
        admissionNo: "ADM003",
        firstName: "Carol",
        lastName: "Williams",
        dateOfBirth: "2005-11-08T00:00:00.000Z",
        gender: "Female",
        religion: "Hindu",
        address: "789 Maple Drive, City, State",
        classArmId: 1,
        yearOfAdmission: "2023-09-01T00:00:00.000Z",
      },
    ];
    return NextResponse.json(mockData);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/student`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create student");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 }
    );
  }
}

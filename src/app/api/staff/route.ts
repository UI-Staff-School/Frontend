import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(req: NextRequest) {
  try {
    console.log(`Fetching from: ${API_BASE_URL}/staff`);

    const response = await fetch(`${API_BASE_URL}/staff`, {
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
          staffId: "STF001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@school.com",
          phoneNumber: "+1234567890",
          address: "123 Main St, City, State",
          gender: "Male",
          religion: "Christian",
          role: "Teacher",
          qualification: "Masters in Education",
          dateOfBirth: "1990-05-15T00:00:00.000Z",
        },
        {
          id: "2",
          staffId: "STF002",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@school.com",
          phoneNumber: "+1234567891",
          address: "456 Oak Ave, City, State",
          gender: "Female",
          religion: "Muslim",
          role: "Admin",
          qualification: "PhD in Administration",
          dateOfBirth: "1985-03-20T00:00:00.000Z",
        },
      ];
      return NextResponse.json(mockData);
    }

    const data = await response.json();
    console.log(
      `Successfully fetched ${
        Array.isArray(data) ? data.length : "unknown"
      } staff members`
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Staff API Error:", error);

    // Return mock data if there's a network error
    console.log("Returning mock data due to network error");
    const mockData = [
      {
        id: "1",
        staffId: "STF001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@school.com",
        phoneNumber: "+1234567890",
        address: "123 Main St, City, State",
        gender: "Male",
        religion: "Christian",
        role: "Teacher",
        qualification: "Masters in Education",
        dateOfBirth: "1990-05-15T00:00:00.000Z",
      },
      {
        id: "2",
        staffId: "STF002",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@school.com",
        phoneNumber: "+1234567891",
        address: "456 Oak Ave, City, State",
        gender: "Female",
        religion: "Muslim",
        role: "Admin",
        qualification: "PhD in Administration",
        dateOfBirth: "1985-03-20T00:00:00.000Z",
      },
    ];
    return NextResponse.json(mockData);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: "POST",
      headers: getApiHeaders(req),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[Staff API] Error response:", errorText);

      let errorMessage = "Failed to create staff";

      try {
        const errorData = JSON.parse(errorText);
        console.log("[Staff API] Parsed error data:", errorData);

        // Handle different error formats from backend
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: any) => e.message || e.msg || e).join(", ");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } catch {
        // If not JSON, use the text directly
        if (errorText) errorMessage = errorText;
      }

      console.log("[Staff API] Final error message:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create staff" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      `Fetching staff member: ${params.id} from ${API_BASE_URL}/staff/${params.id}`
    );

    const response = await fetch(`${API_BASE_URL}/staff/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);

      // Return mock data for specific ID
      const mockStaff = {
        id: params.id,
        staffId: `STF${params.id.padStart(3, "0")}`,
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
      };
      return NextResponse.json(mockStaff);
    }

    const data = await response.json();
    console.log(`Successfully fetched staff member: ${params.id}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Staff member API Error:", error);

    // Return mock data if there's an error
    const mockStaff = {
      id: params.id,
      staffId: `STF${params.id.padStart(3, "0")}`,
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
    };
    return NextResponse.json(mockStaff);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const response = await fetch(`${API_BASE_URL}/staff/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update staff");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/staff/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete staff member");
    }

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete staff member" },
      { status: 500 }
    );
  }
}

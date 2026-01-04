import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";

const API_BASE_URL = "https://ui-staff-school-backend.onrender.com";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = params.id;
    console.log(
      `Fetching staff member: ${staffId} from ${API_BASE_URL}/staff/${staffId}`
    );

    // Try fetching by staffId first (e.g., STF001)
    let response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
      method: "GET",
      headers: getApiHeaders(req),
    });

    // If not found and the ID looks like a staffId format, also try the staff list endpoint
    if (!response.ok && response.status === 404) {
      console.log(`Staff not found by ID, trying to fetch from list...`);

      // Fetch all staff and find by staffId
      const listResponse = await fetch(`${API_BASE_URL}/staff`, {
        method: "GET",
        headers: getApiHeaders(req),
      });

      if (listResponse.ok) {
        const staffList = await listResponse.json();
        const staffArray = Array.isArray(staffList) ? staffList : staffList.data || [];
        const foundStaff = staffArray.find(
          (s: any) => s.staffId === staffId || String(s.id) === staffId || s._id === staffId
        );

        if (foundStaff) {
          console.log(`Found staff member in list: ${staffId}`);
          return NextResponse.json(foundStaff);
        }
      }
    }

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched staff member: ${staffId}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Staff member API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch staff member" },
      { status: 500 }
    );
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
      headers: getApiHeaders(req),
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
      headers: getApiHeaders(req),
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

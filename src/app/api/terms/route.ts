import { NextRequest, NextResponse } from "next/server";
import { getApiHeaders } from "@/lib/api-utils";
import { buildExternalApiUrl } from "@/lib/external-api";

type RawTerm = {
  id?: number | string;
  termId?: number | string;
  name?: string;
  termName?: string;
  term?: string;
  year?: string;
  academicYear?: string;
  sessionId?: number | string;
};

type RawSession = {
  id?: number | string;
  sessionId?: number | string;
  name?: string;
  sessionName?: string;
  academicYear?: string;
  year?: string;
  terms?: RawTerm[];
  Terms?: RawTerm[];
  termList?: RawTerm[];
  term?: RawTerm | RawTerm[];
};

function normalizeTerms(sessionsPayload: any): RawTerm[] {
  const sessionArray: RawSession[] = Array.isArray(sessionsPayload?.data)
    ? sessionsPayload.data
    : Array.isArray(sessionsPayload?.sessions)
    ? sessionsPayload.sessions
    : Array.isArray(sessionsPayload)
    ? sessionsPayload
    : [];

  const collectedTerms: RawTerm[] = [];

  const pickTerms = (session: RawSession): RawTerm[] => {
    if (Array.isArray(session.terms)) return session.terms;
    if (Array.isArray(session.Terms)) return session.Terms;
    if (Array.isArray(session.termList)) return session.termList;
    if (Array.isArray(session.term)) return session.term;
    if (session.term && !Array.isArray(session.term)) return [session.term];
    return [];
  };

  for (const session of sessionArray) {
    const sessionYear =
      session.academicYear || session.year || session.sessionName || session.name;
    const sessionId = session.sessionId ?? session.id;

    const terms = pickTerms(session);
    if (!terms.length) continue;

    for (const term of terms) {
      collectedTerms.push({
        id: term.id ?? term.termId,
        name: term.name ?? term.termName ?? term.term,
        year: term.academicYear ?? term.year ?? sessionYear,
        sessionId,
      });
    }
  }

  if (!collectedTerms.length && Array.isArray(sessionsPayload?.terms)) {
    return sessionsPayload.terms;
  }

  return collectedTerms;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(buildExternalApiUrl("/session"), {
      method: "GET",
      headers: getApiHeaders(req),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Failed to fetch sessions", details: payload },
        { status: response.status }
      );
    }

    const terms = normalizeTerms(payload);

    return NextResponse.json({ terms });
  } catch (error: any) {
    console.error("[Terms][GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch terms" },
      { status: 500 }
    );
  }
}

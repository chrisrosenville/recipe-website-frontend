import { NextResponse } from "next/server";

// Simple middleware can be extended later for route protection
export function middleware() {
  return NextResponse.next();
}

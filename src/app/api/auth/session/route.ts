'use server';
import { getSession } from "@app/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const data = await getSession();
  return NextResponse.json({ data });
}
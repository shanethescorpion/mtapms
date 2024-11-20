'use server'

import mongodbConnect from "@app/lib/db";
import Schedule from "@app/models/Schedule";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const data = await Schedule.find({}).select('academicYear range orientationDate examDate interviewDate scholarshipSlots isProfileOpen').exec()
    return NextResponse.json({ data })
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
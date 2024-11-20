'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Student from "@app/models/Student";
import { Roles, StudentModel } from "@app/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params: { studentId }}: { params: { studentId: string }}) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Grantee) {
      const data = await  Student.findById(studentId).select('email isGrantee studentId').lean<StudentModel>()
      return NextResponse.json({ data })
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: null })
}
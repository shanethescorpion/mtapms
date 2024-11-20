'use server';
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Student from "@app/models/Student";
import { Roles, StudentModel } from "@app/types";
import { isObjectIdOrHexString } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type ParamProps = {
  params: {
    studentId: string
  }
}

export async function GET(request: NextRequest, { params: { studentId }}: ParamProps) {
  await mongodbConnect()
  try {
    const session = await getSession();
    if (session?.user?.role !== Roles.Admin && isObjectIdOrHexString(studentId)) {
      let q = Student.findById(studentId).select('email applicationForm studentId photo').lean<StudentModel>()
      const populate = request.nextUrl.searchParams.get('populate')
      if (!!populate) {
        if (populate === 'schedule') {
          q = q.populate('applicationForm.scheduleId')
        }
      }
      const student = await q.exec()
      const data = !!student ? { ...student, ...student?.applicationForm, studId: student._id!.toString() } : null
      delete data?.applicationForm
      return NextResponse.json({ data })
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: null })
}
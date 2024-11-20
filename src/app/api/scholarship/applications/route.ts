'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { Roles } from "@app/types";
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession();
    const academicYear = parseInt(request.nextUrl.searchParams.get('academicYear') as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    if (session?.user?.role === Roles.Admin) {
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!!schedule?._id) {
        const filter: any = { 'applicationForm.scheduleId': schedule._id.toString() }
        const data = await Student.find(filter).select('isGrantee email applicationForm studentId photo').exec()
        return NextResponse.json({ data })
      }
    } else if (session?.user?.role === Roles.Applicant || session?.user?.role === Roles.Grantee) {
      const studentId = session?.user?._id?.toString()
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!!schedule?._id) {
        const student = await Student.findById(studentId).select('isGrantee email applicationForm studentId').exec()
        if (!!student && student.applicationForm.scheduleId.toString() === schedule._id.toString()) {
          return NextResponse.json({ data: student.applicationForm })
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
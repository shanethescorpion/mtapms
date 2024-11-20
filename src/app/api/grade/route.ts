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
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const academicYear = request.nextUrl.searchParams.get('academicYear')
      const schedule = await Schedule.findOne({ academicYear }).exec()
      const students = !!schedule?._id ? (await Student.find({ 'applicationForm.scheduleId': schedule._id.toHexString() }).exec()) : null;
      const examDate = moment(schedule.examDate).tz('Asia/Manila').toDate()
      const dateNow = moment.tz('Asia/Manila').toDate()
      if (!!students && dateNow.getTime() >= examDate.getTime() && dateNow.getTime() <= examDate.getTime() + (1000 * 60 * 60 * 24 * 180)) {
        const data = students.map(student => ({ _id: student._id.toString(), email: student.email, scheduleId: student.applicationForm.scheduleId,
            firstName: student.applicationForm.firstName, lastName: student.applicationForm.lastName, middleName: student.applicationForm.middleName,
            sex: student.applicationForm.sex, civilStatus: student.applicationForm.civilStatus,
            nameOfSchoolAttended: student.applicationForm.nameOfSchoolAttended, schoolSector: student.applicationForm.schoolSector,
            grade: { score: schedule.examScores.find((item: { studentId: any, percentageScore: number }) => item.studentId.toString() === student._id.toString())?.percentageScore },
            remarks: !!schedule.examScores.find((item: { studentId: any, percentageScore: number }) => item.studentId.toString() === student._id.toString())?.percentageScore ? (parseFloat(schedule.examScores.find((item: { studentId: any, percentageScore: number }) => item.studentId.toString() === student._id.toString())?.percentageScore) < Number.parseFloat(process.env.NEXT_PUBLIC_EXAM_PASSING || "75") ? 'FAILED' : 'PASSED') : 'N/A'
          }));
        return NextResponse.json({ data })
      }
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
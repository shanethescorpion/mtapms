'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { Roles, ScheduleModel } from "@app/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const academicYear = request.nextUrl.searchParams.get('academicYear')
      const action = request.nextUrl.searchParams.get('action')
      const schedule = await Schedule.findOne({ academicYear }).exec()
      const students = !!schedule?._id ? (await Student.find({ 'applicationForm.scheduleId': schedule._id.toHexString() }).exec()) : null;
      if (!!students && action === 'notAttended') {
        const data = students.filter(student => !(schedule as ScheduleModel).orientationAttendance.map(student => student.studentId.toString()).some((studentId) => studentId === student._id.toString()))
          .map(student => ({ _id: student._id, email: student.email, scheduleId: student.applicationForm.scheduleId,
            firstName: student.applicationForm.firstName, lastName: student.applicationForm.lastName, middleName: student.applicationForm.middleName,
            sex: student.applicationForm.sex, civilStatus: student.applicationForm.civilStatus,
            nameOfSchoolAttended: student.applicationForm.nameOfSchoolAttended, schoolSector: student.applicationForm.schoolSector,
          }));
        return NextResponse.json({ data })
      } else if (!!students && action === 'attended') {
        const data = students.filter(student => (schedule as ScheduleModel).orientationAttendance.map(student => student.studentId.toString()).some((studentId) => studentId === student._id.toString()))
          .map(student => ({ _id: student._id, email: student.email, scheduleId: student.applicationForm.scheduleId,
            firstName: student.applicationForm.firstName, lastName: student.applicationForm.lastName, middleName: student.applicationForm.middleName,
            sex: student.applicationForm.sex, civilStatus: student.applicationForm.civilStatus,
            nameOfSchoolAttended: student.applicationForm.nameOfSchoolAttended, schoolSector: student.applicationForm.schoolSector,
          }));
        return NextResponse.json({ data })
      }
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
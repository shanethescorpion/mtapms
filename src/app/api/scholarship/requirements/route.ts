'use server';
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Requirement from "@app/models/Requirement";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { Roles, StudentModel } from "@app/types";
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession();
    const academicYear = parseInt(request.nextUrl.searchParams.get('academicYear') as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    const forFirstYearOnly = request.nextUrl.searchParams.get('firstYearOnly') === 'true' ? true : request.nextUrl.searchParams.get('firstYearOnly') === 'false' ? false : undefined;
    if ([Roles.Admin, Roles.Applicant, Roles.Grantee].includes(session?.user?.role)) {
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (session!.user.role === Roles.Applicant) {
        const student = await Student.findById(session!.user._id).lean<StudentModel>().exec();
        if (!student) {
          return NextResponse.json({ data: [] })
        }
        if (!student.applicationForm || student.applicationForm.scheduleId?.toString() !== schedule?._id?.toString()) {
          return NextResponse.json({ data: [] })
        }
      }
      if (!!schedule?._id) {
        const filter: any = { scheduleId: schedule._id.toString() }
        if (forFirstYearOnly !== undefined) {
          filter.forFirstYearOnly = forFirstYearOnly
        }
        const data = await Requirement.find(filter).exec()
        return NextResponse.json({ data })
      }
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
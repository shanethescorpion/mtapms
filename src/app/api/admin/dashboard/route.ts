'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { Roles, ScheduleModel, StudentModel } from "@app/types";
import { YearLevel } from '@app/types/index';
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const totalUsers = await Student.find({}).countDocuments()
      const scholars = await Student.find({ isGrantee: true, applicationForm: { $exists: true } }).populate('applicationForm.scheduleId').lean<StudentModel[]>().exec()
      const latestSchedule = await Schedule.find({}).sort('-academicYear').select('academicYear').limit(1).lean<ScheduleModel[]>().exec()
      const latestAcademicYear = latestSchedule.length > 0 ? latestSchedule[0].academicYear : (moment.tz('Asia/Manila').toDate()).getFullYear()
      const graduates = scholars.filter(s => latestAcademicYear - (s.applicationForm!.scheduleId as ScheduleModel).academicYear > 4 - s.applicationForm!.yearLevel)
      const totalApplicants = await Student.find({ applicationForm: { $exists: true }, 'applicationForm.scheduleId': latestSchedule?.[0]?._id?.toString() }).countDocuments().exec()
      const listOfGranteesPerYearLevel = scholars.reduce((initial: ({ yearLevel: YearLevel, grantees: number })[], scholar: StudentModel) => {
        const yearLevel: YearLevel = scholar.applicationForm!.yearLevel;
        const found = initial.findIndex((s: { yearLevel: YearLevel, grantees: number }) => s.yearLevel === yearLevel)
        if (found === -1) {
          initial.push({ yearLevel, grantees: 1 })
        } else {
          initial[found].grantees += 1;
        }
        return [...initial];
      }, []);
      console.log(listOfGranteesPerYearLevel)
      const data = { totalScholars: scholars.length, totalGraduates: graduates.length, totalUsers, totalApplicants, listOfGranteesPerYearLevel }
      return NextResponse.json({ data })
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: {} })
}
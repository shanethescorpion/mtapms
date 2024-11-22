'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { ApplicationStatus, Roles, ScheduleModel } from "@app/types";
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const academicYear = request.nextUrl.searchParams.get('sy')
      const result = await Schedule.findOne({ academicYear }).select('academicYear range orientationDate examDate interviewDate').lean<ScheduleModel>().exec()
      const data: ScheduleModel = !result ? null : JSON.parse(JSON.stringify(result)).academicYear
      return NextResponse.json({ data })
    } else if (session?.user?.role === Roles.Applicant) {
      const action = request.nextUrl.searchParams.get('action')
      const academicYear = request.nextUrl.searchParams.get('sy')
      const selection = 'academicYear range orientationDate examDate interviewDate isProfileOpen' + (action === 'scheduleandresult' ? ' examScores' : '')
      const result = await Schedule.findOne({ academicYear }).select(selection).lean<ScheduleModel>().exec()
      const dataRecent: ScheduleModel|null = result
      if (!!dataRecent) {
        const recentStartDate = moment(dataRecent?.range.startDate).tz('Asia/Manila').toDate()
        const recentEndDate = moment(dataRecent?.range.endDate).tz('Asia/Manila').toDate()
        const now = moment.tz('Asia/Manila').toDate()
        const data = !!dataRecent && (recentStartDate.getTime() <= now.getTime() && recentEndDate.getTime() >= now.getTime()) && dataRecent.isProfileOpen ? dataRecent : null
        if (!!data) {
          const student = await Student.findById(session.user._id).exec()
          if ((action === 'documents' || action === 'scheduleandresult') && !!student && student?.applicationForm?.scheduleId.toString() === data._id!.toString()) {
            return NextResponse.json({ data })
          } else  if (!student?.applicationForm || student?.applicationForm?.scheduleId.toString() !== data._id?.toString()) {
            return NextResponse.json({ data })
          } else if (!!student && student?.applicationForm?.scheduleId.toString() === data._id!.toString() && student?.applicationForm?.applicationStatus === ApplicationStatus.Rejected) {
            return NextResponse.json({ data })
          } else if (!!student && student?.applicationForm?.scheduleId.toString() === data._id!.toString() && student?.applicationForm?.applicationStatus === ApplicationStatus.Submitted) {
            return NextResponse.json({ data: true })
          }
        }
      }}
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: null })
}
'use server'

import mongodbConnect from "@app/lib/db"
import Schedule from "@app/models/Schedule"
import Student from "@app/models/Student"
import { ScheduleModel, StudentModel } from "@app/types"
import moment from "moment-timezone"

export async function fetchPrintData(template: string, { ...args }: any) {
  await mongodbConnect()
  if (template === 'application') {
    const academicYear = parseInt(args.academicYear as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    const studentId = args.studentId as string
    const student = await Student.findOne({ _id: studentId }).select('-applicationSubmission -password -emailVerified').populate('applicationForm.scheduleId').lean<StudentModel>().exec()
    if (!!student?._id) {
      const ay = 'A.Y. ' + academicYear + ' - ' + (academicYear + 1)
      if ((student.applicationForm!.scheduleId as ScheduleModel)?.academicYear === academicYear) {
        const data = {
          ...student,
          ...student.applicationForm,
          academicYear: ay,
          studentId: student._id
        };
        delete data.applicationForm
        delete data.scheduleId
        return JSON.parse(JSON.stringify(data))
      }
    }
    return {}
  }
  if (template === "application-list") {
    const academicYear = parseInt(args.academicYear as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    const sched = await Schedule.findOne({ academicYear }).lean<ScheduleModel>().exec();
    const applicants = await Student.find({ 'applicationForm.scheduleId': sched?._id?.toString() }).select('-applicationSubmission -password -emailVerified').lean<StudentModel>().exec();
    const sy = 'S.Y. ' + academicYear + ' - ' + (academicYear + 1)
    return JSON.parse(JSON.stringify({
      applicants,
      academicYear: sy,
    }))
  }
  if (template === "grantees-list") {
    const academicYear = parseInt(args.academicYear as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    const sched = await Schedule.findOne({ academicYear }).lean<ScheduleModel>().exec();
    const grantees = await Student.find({ isGrantee: true, 'applicationForm.scheduleId': sched?._id?.toString() }).select('-applicationSubmission -password -emailVerified').lean<StudentModel>().exec();
    const oldGrantees = await Student.find({
      isGrantee: true,
      'applicationForm.scheduleId': { $ne: sched?._id?.toString() }
    })
      .select('-applicationSubmission -password -emailVerified')
      .lean<StudentModel>()
      .exec();
    const sy = 'S.Y. ' + academicYear + ' - ' + (academicYear + 1)
    return JSON.parse(JSON.stringify({
      grantees,
      oldGrantees,
      academicYear: sy,
    }))
  }
}

'use server'

import mongodbConnect from "@app/lib/db";
import { getGradeStatus } from "@app/lib/gradeStatus";
import { getSession } from "@app/lib/session";
import Grantee from "@app/models/Grantee";
import Requirement from "@app/models/Requirement";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import {
  ApplicationFormProps,
  GranteeModel,
  RequirementModel,
  RequirementSubmissionModel,
  Roles,
  ScheduleModel,
  Semester,
  StudentModel,
  YearLevel,
} from "@app/types";
import moment from "moment-timezone";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const session = await getSession();
    const academicYear = parseInt(request.nextUrl.searchParams.get('academicYear') as string) || (moment.tz('Asia/Manila').toDate()).getFullYear()
    const type = request.nextUrl.searchParams.get('type') as string
    if (session?.user?.role === Roles.Admin) {
      const semester = request.nextUrl.searchParams.get('semester') as Semester|null
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!!schedule?._id) {
        const filter: any = { }
        if (type === 'new_firstYear') {
          filter.$and = [{ 'applicationForm.scheduleId': { $exists: true } }, { 'applicationForm.scheduleId': schedule._id.toHexString() }, { 'applicationForm.yearLevel': YearLevel.FirstYear }]
        } else if (type === 'new') {
          filter.$and = [{ 'applicationForm.scheduleId': { $exists: true } }, { 'applicationForm.scheduleId': schedule._id.toHexString() }, { 'applicationForm.yearLevel': { $ne: YearLevel.FirstYear }}]
        } else {
          filter.isGrantee = true
          filter['applicationForm.scheduleId'] = { $exists: true }
          filter.$and = [
            { applicationSubmission: { $exists: true } },
            // the number of elements of applicationSubmission is not empty
            {
              $expr: {
                $gt: [
                  { $size: '$applicationSubmission' },
                  0
                ]
              }
            }
          ]
        }
        const students = await Student.find(filter).select('email applicationForm isGrantee applicationSubmission studentId photo').populate('applicationForm.scheduleId applicationSubmission').lean<StudentModel[]>().exec()
        const mappedStudents = await Promise.all(students.filter((st: StudentModel) => {
          const sched = ((st.applicationForm as ApplicationFormProps).scheduleId as ScheduleModel);
          return sched.academicYear + 4 > academicYear
        })
          .map(async (st: StudentModel) => ({
            ...st,
            granteeSubmissions: (await Grantee.findOne({ academicYear, semester, studentId: st._id?.toString() }).exec()),
            gradeStatus: (await getGradeStatus(st._id?.toString())),
          })))
        const data: (StudentModel & { granteeSubmissions?: GranteeModel }|any)[] =
          type === 'grantee'
          ? mappedStudents.filter((st: StudentModel & { granteeSubmissions?: GranteeModel }) => !!st.granteeSubmissions)
            .map((st: StudentModel & { granteeSubmissions?: GranteeModel }) => ({ ...st, applicationSubmission: [] }))
          : type === 'new_firstYear'
          ? await Promise.all(students.filter((st: StudentModel) => {
              const sched = ((st.applicationForm as ApplicationFormProps).scheduleId as ScheduleModel);
              return sched.academicYear == academicYear && (st.applicationForm as ApplicationFormProps).yearLevel == YearLevel.FirstYear
            }).map(async (st: StudentModel) => ({
              ...st,
              applicationSubmission: (await Promise.all((st.applicationSubmission as RequirementSubmissionModel[])
                .map(async (item) => ({...item, requirementId: await Requirement.findById(item.requirementId).lean<RequirementModel>().exec() }))))
                .filter((req: RequirementSubmissionModel|any) => (req.requirementId as RequirementModel).forFirstYearOnly) })))
          : type === 'new'
          ? await Promise.all(students.filter((st: StudentModel) => {
              const sched = ((st.applicationForm as ApplicationFormProps).scheduleId as ScheduleModel);
              return sched.academicYear == academicYear && (st.applicationForm as ApplicationFormProps).yearLevel !== YearLevel.FirstYear
            })
            .map(async (st: StudentModel) => ({
              ...st,
              applicationSubmission: (
                await Promise.all(
                  (st.applicationSubmission as RequirementSubmissionModel[])
                    .map(async (item) => ({
                      ...item,
                      requirementId: await Requirement.findById(item.requirementId).lean<RequirementModel>().exec()
                    })
                  )
                )
              )
                .filter((req: RequirementSubmissionModel|any) => !(req.requirementId as RequirementModel).forFirstYearOnly) })))
          : []
        return NextResponse.json({ data })
      }
    } else if (session?.user?.role === Roles.Applicant) {
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!!schedule?._id) {
        const student = await Student.findOne({ _id: session.user._id, $and: [{ 'applicationForm.scheduleId': { $exists: true }}, { 'applicationForm.scheduleId': schedule._id.toHexString() }] }).populate('applicationSubmission').lean<StudentModel>().exec()
        if (!!student?._id) {
          const data: (StudentModel & any) = type === 'applicant_firstYear'
            ? ({...student, applicationSubmission: (await Promise.all((student.applicationSubmission as RequirementSubmissionModel[]).map(async (item, i) => {
              const requirementId = await Requirement.findById(item.requirementId).lean<RequirementModel>().exec()
              return {...item, requirementId }
            }))).filter((req) => (req.requirementId as RequirementModel).forFirstYearOnly) })
            : type === 'applicant'
            ? ({...student, applicationSubmission: (await Promise.all((student.applicationSubmission as RequirementSubmissionModel[]).map(async (item, i) => {
              const requirementId = await Requirement.findById(item.requirementId).lean<RequirementModel>().exec()
              return {...item, requirementId }
            }))).filter((req) => !(req.requirementId as RequirementModel).forFirstYearOnly) })
            : null
          return NextResponse.json({ data })
        }
      }
      return NextResponse.json({ data: null })
    } else if (session?.user?.role === Roles.Grantee) {
      const semester = request.nextUrl.searchParams.get('semester') as Semester|null
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!!schedule?._id) {
        const student = await Student.findOne({
          _id: session.user._id,
          isGrantee: true,
          applicationForm: { $exists: true }
        }).lean<StudentModel>().exec()
        if (!!student?._id) {
          const data: (StudentModel & any) = type === 'grantee'
            ? ({
                ...student,
                applicationSubmission: [],
                granteeSubmissions: (await Grantee.findOne({ academicYear, semester, studentId: student._id?.toString() }).exec()),
                gradeStatus: (await getGradeStatus(student._id?.toString()))
              })
            : null
          return NextResponse.json({ data })
        }
      }
      return NextResponse.json({ data: null })
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
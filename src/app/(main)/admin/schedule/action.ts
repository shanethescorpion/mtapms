'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Grantee from "@app/models/Grantee";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { ActionResponse, Roles, ScheduleModel, Semester, StudentModel } from "@app/types";
import moment from "moment-timezone";

export async function scheduleAction(academicYear: number, prevState: ActionResponse, formData: FormData): Promise<ActionResponse>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      // check first if already has schedule
      const dataForm = Object.fromEntries(formData.entries())
      const sched = await Schedule.exists({ academicYear }).exec()
      if (!!sched?._id) {
        return {
          error: 'Schedule already set'
        }
      }
      if (!dataForm['range.startDate'] || !dataForm['range.endDate']) {
        return {
          error: 'Scholarship Range Date Required'
        }
      }
      if (!dataForm.scholarshipSlots) {
        return {
          error: 'Scholarship Slots Required'
        }
      }
      let orientationDate, examDate, interviewDate;
      if (dataForm.orientationDate) {
        const combined = `${dataForm.orientationDate}T${dataForm.orientationTime}:00`
        orientationDate = moment(combined).tz('Asia/Manila').toDate()
      }
      if (dataForm.examDate) {
        const combined = `${dataForm.examDate}T${dataForm.examTime}:00`
        examDate = moment(combined).tz('Asia/Manila').toDate()
      }
      if (dataForm.interviewDate) {
        const combined = `${dataForm.interviewDate}T${dataForm.interviewTime}:00`
        interviewDate = moment(combined).tz('Asia/Manila').toDate()
      }
      const range = {
        startDate: moment(dataForm['range.startDate'].toString() + 'T00:00:00').tz('Asia/Manila').toDate(),
        endDate: moment(dataForm['range.endDate'].toString() + 'T00:00:00').tz('Asia/Manila').toDate()
      };
      const scholarshipSlots = dataForm.scholarshipSlots as string
      const data = {
        academicYear,
        range,
        orientationDate,
        examDate,
        interviewDate,
        scholarshipSlots
      }
      const result = await Schedule.create(data);
      if (!!result?._id) {
        // initiate all grantees for their requirement submission
        const grantees = await Student.find({ isGrantee: true, $and: [{'applicationForm.scheduleId': { $exists: true } }]}).select('_id applicationForm').lean<StudentModel[]>()
        await Promise.all(grantees.map(async (grantee: StudentModel) => {
          const sched = await Schedule.findById(grantee.applicationForm!.scheduleId.toString()).lean<ScheduleModel>().exec()
          if (!!sched?._id && (academicYear - sched.academicYear) < (4 - grantee.applicationForm!.yearLevel)) {
            try {
              await Grantee.create({
                studentId: grantee._id,
                academicYear,
                semester: Semester.FirstSemester,
              })
            } catch (e) {
              console.log("grantee error", e)
            }
          }
        }))
        return {
          success: 'Successfully Schedule Scholarship Application Date'
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Bad Request'
  }
}

export async function scheduleUpdateAction(academicYear: number, prevState: ActionResponse, formData: FormData): Promise<ActionResponse>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const dataForm = Object.fromEntries(formData.entries())
      const schedule = await Schedule.findOne({ academicYear }).exec()
      if (!schedule?._id) {
        return {
          error: 'Schedule not found'
        }
      }
      let orientationDate, examDate, interviewDate, range, scholarshipSlots, isProfileOpen;
      if (dataForm.orientationDate) {
        const combined = `${dataForm.orientationDate}T${dataForm.orientationTime}:00`
        orientationDate = moment(combined).tz('Asia/Manila').toDate()
      }
      if (dataForm.examDate) {
        const combined = `${dataForm.examDate}T${dataForm.examTime}:00`
        examDate = moment(combined).tz('Asia/Manila').toDate()
      }
      if (dataForm.interviewDate) {
        const combined = `${dataForm.interviewDate}T${dataForm.interviewTime}:00`
        interviewDate = moment(combined).tz('Asia/Manila').toDate()
      }
      if (dataForm['range.startDate'] && dataForm['range.endDate']) {
        range = {
          startDate: moment(dataForm['range.startDate'].toString() + 'T00:00:00').tz('Asia/Manila').toDate(),
          endDate: moment(dataForm['range.endDate'].toString() + 'T00:00:00').tz('Asia/Manila').toDate()
        }
      }
      if (dataForm.isProfileOpen) {
        isProfileOpen = dataForm.isProfileOpen === "true";
      }
      if (dataForm.scholarshipSlots) {
        scholarshipSlots = parseInt(dataForm.scholarshipSlots as string)
      }
      const dataSet = {
        orientationDate,
        examDate,
        interviewDate,
        'range.startDate': range?.startDate,
        'range.endDate': range?.endDate,
        scholarshipSlots,
        isProfileOpen
      };
      const $set = Object.fromEntries(Object.entries(dataSet).filter(([key, value]: any[]) => value !== undefined))
      const result = await Schedule.findByIdAndUpdate(schedule?._id, { $set }, { new: true, upsert: false, runValidators: true }).exec();
      if (!!result?._id) {
        return {
          success: 'Successfully Update Schedule'
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Bad Request'
  }
}
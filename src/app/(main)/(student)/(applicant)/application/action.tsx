'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Student from "@app/models/Student";
import { ActionResponseInterface, Roles } from "@app/types";

export async function ScholarshipApplicationAction(scheduleId: string, formData: string): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Applicant) {
      const data = JSON.parse(formData) as Record<string, any>
      data.scheduleId = scheduleId
      const applicant = await Student.findById(session.user._id).exec()
      if (!!applicant?._id) {
        const studentId = data.studentId
        if (!!studentId) {
          applicant.studentId = studentId
          delete data.studentId
        }
        // console.log({ ...data })
        applicant.applicationForm = { ...data }
        const updated = await applicant.save({ new: true, upsert: false, runValidators: true })
        if (!!updated?._id) {
          return {
            success: 'Successfully saved application form'
          }
        } else {
          return {
            error: 'Failed to save application form. Please try again later.'
          }
        }
      } else {
        return {
          error: 'Failed to save application form. Please try again later.'
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
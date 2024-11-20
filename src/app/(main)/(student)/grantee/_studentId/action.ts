'use server'

import mongodbConnect from "@app/lib/db"
import { getSession } from "@app/lib/session"
import Student from "@app/models/Student"
import { ActionResponseInterface, Roles } from "@app/types"

export async function addStudentId(studentId: string): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Grantee) {
      const student = await Student.findOne({ _id: session.user._id, isGrantee: true }).exec()
      student.studentId = studentId
      const updated = await student.save({ new: true, runValidators: true })
      if (updated?.studentId === studentId) {
        return {
          success: 'Student ID updated successfully.',
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to append student ID. Please try again or refresh the page.',
  }
}
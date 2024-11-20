'use server'

import mongodbConnect from "@app/lib/db"
import { compare } from "@app/lib/hash"
import { getSession } from "@app/lib/session"
import Admin from "@app/models/Admin"
import Student from "@app/models/Student"
import { ActionResponseInterface, Roles } from "@app/types"

export async function changePass(oldPassword: string, newPassword: string): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const Model = session.user.role === Roles.Admin ? Admin : Student;
    const user = await Model.findById(session.user._id).exec()
    if (!user) {
      return {
        error: 'User not found',
      }
    }
    const isMatch = await compare(oldPassword, user.password)
    if (!isMatch) {
      return {
        error: 'Incorrect old password',
      }
    }
    user.password = newPassword
    const updated = await user.save({ new: true, runValidators: true })
    if (!!updated?._id) {
      return {
        success: 'Password changed successfully',
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to change password',
  }
}
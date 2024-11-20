'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Requirement from "@app/models/Requirement";
import { ActionResponse, ActionResponseInterface, Roles } from "@app/types";

export async function createRequirement(scheduleId: string, forFirstYearOnly: boolean, prevState: ActionResponse, formData: FormData): Promise<ActionResponse>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const name = formData.get('name')
      const description = formData.get('description')
      if (!name) {
        return {
          error: 'Requirement Name is required'
        }
      }
      const result = await Requirement.create({
        scheduleId,
        name,
        description,
        forFirstYearOnly,
      })
      if (!!result?._id) {
        return {
          success: 'Successfully Created Requirement'
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to Create Requirement'
  }
}

export async function removeRequirement(requirementId: string): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const result = await Requirement.deleteOne({ _id: requirementId }, { runValidators: true }).exec()
      if (result.acknowledged && result.deletedCount > 0) {
        return {
          success: 'Successfully Removed Requirement'
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to Remove Requirement'
  }
}
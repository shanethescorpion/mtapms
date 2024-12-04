'use server'

import mongodbConnect from "@app/lib/db"
import { getSession } from "@app/lib/session"
import Courses from "@app/models/Courses"

export async function createCourse(formData: FormData) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const name = formData.get('name')
    if (!name) {
      return {
        error: 'Invalid form data',
      }
    }
    const created = await Courses.create({
      name,
      createdBy: session.user._id,
    });
    if (!!created?._id) {
      return {
        success: 'Course added successfully',
      }
    }
  } catch (err: any) {
    return {
      error: 'Failed to add the course. Reason: ' + err.message,
    }
  }
  return {
    error: 'Failed to add the course',
  }
}

export async function updateCourse(id: string, formData: FormData) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const name = formData.get('name')
    if (!name) {
      return {
        error: 'Invalid form data',
      }
    }
    const updated = await Courses.updateOne({ _id: id }, { name, createdBy: session.user?._id }, { new: true, upsert: false, runValidators: true }).exec();
    if (updated.acknowledged && updated.modifiedCount > 0) {
      return {
        success: 'Course updated successfully',
      }
    }
  } catch (err: any) {
    return {
      error: 'Failed to update the course. Reason: ' + err.message,
    }
  }
  return {
    error: 'Failed to update the course',
  }
}

export async function deleteCourse(id: string) {
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const updated = await Courses.deleteOne({ _id: id }, { runValidators: true }).exec();
    if (updated.acknowledged && updated.deletedCount > 0) {
      return {
        success: 'Course deleted successfully',
      }
    }
  } catch (err: any) {
    return {
      error: 'Failed to deleted the course. Reason: ' + err.message,
    }
  }
  return {
    error: 'Failed to deleted the course',
  }
}
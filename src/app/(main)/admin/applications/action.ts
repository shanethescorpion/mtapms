'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Schedule from "@app/models/Schedule";
import Student from "@app/models/Student";
import { ActionResponseInterface, ApplicationStatus } from "@app/types";

export async function rejectApplicationForm(formData: FormData): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const studentId = formData.get('studentId') as string
    const academicYear = formData.get('academicYear') as string
    const rejectReason = formData.get('rejectReason') as string
    if (!studentId || !academicYear) {
      return {
        error: 'Invalid form data',
      }
    }
    const sched = await Schedule.findOne({ academicYear }).select('academicYear').exec();
    if (!sched) {
      return {
        error: 'Invalid schedule',
      }
    }
    const student = await Student.updateOne(
      { _id: studentId, 'applicationForm.scheduleId': sched._id?.toString() },
      {
        'applicationForm.applicationStatus': ApplicationStatus.Rejected,
        'applicationForm.rejectReason': rejectReason,
      },
      { runValidators: true }
    ).select('applicationForm').exec()
    if (!(student.acknowledged && student.matchedCount > 0)) {
      throw new Error('Failed to reject application');
    }
    console.log("Success");
    return {
      success: 'Application form rejected successfully',
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to Reject Application Form. Please try again.',
  }
}
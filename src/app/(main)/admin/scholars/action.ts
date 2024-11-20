'use server'

import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Grantee from "@app/models/Grantee";
import RequirementSubmission from "@app/models/RequirementSubmission";
import { ActionResponseInterface, GranteeModel, Roles, SubmissionStatus } from "@app/types";
import { Semester } from '@app/types/index';

export async function approvePendingSubmission(type: 'new'|'new_firstYear'|'grantee', id: string, name: string, grade?: string|number): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const Model = type === 'grantee' ? Grantee : RequirementSubmission
      const submission = await Model.findById(id).exec()
      if (!!submission) {
        if (type === 'grantee') {
          submission[name].status = SubmissionStatus.Approved
          if (name === 'COG' && !!grade) {
            submission.grade = Number.parseFloat(grade.toString())
          }
        } else {
          submission.status = SubmissionStatus.Approved
        }
        const updated = await submission.save()
        if (!!updated?._id && (updated[name]?.status === SubmissionStatus.Approved || updated.status === SubmissionStatus.Approved)) {
          if (type === 'grantee') {
            try {
              const allApproved = [
                (updated as GranteeModel).COG?.status === SubmissionStatus.Approved,
                (updated as GranteeModel).studyLoad?.status === SubmissionStatus.Approved,
                (updated as GranteeModel).statementOfAccount?.status === SubmissionStatus.Approved,
                (updated as GranteeModel).CONS?.status === SubmissionStatus.Approved,
              ].every(Boolean)
              if (allApproved) {
                // create Grantee submission for the next semester
                await Grantee.create({
                  academicYear: updated.semester === Semester.SecondSemester ? updated.academicYear + 1 : updated.academicYear,
                  semester: updated.semester === Semester.SecondSemester ? Semester.FirstSemester : Semester.SecondSemester,
                  studentId: updated.studentId,
                })
              }
            } catch (er) {
              console.log(er)
            }
          }
          return {
            success: `Successfully approved submission of ${name}`,
          }
        }
      } else {
        return {
          error: 'Submission not found',
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return {
    error: 'Failed to approve submission'
  }
}

export async function disapprovePendingSubmission(type: 'new'|'new_firstYear'|'grantee', id: string, name: string): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (session?.user?.role === Roles.Admin) {
      const Model = type === 'grantee' ? Grantee : RequirementSubmission
      const submission = await Model.findById(id).exec()
      if (!!submission) {
        if (type === 'grantee') {
          submission[name].status = SubmissionStatus.Disapproved
        } else {
          submission.status = SubmissionStatus.Disapproved
        }
        const updated = await submission.save()
        if (!!updated?._id && (updated[name]?.status === SubmissionStatus.Disapproved || updated.status === SubmissionStatus.Disapproved)) {
          return {
            success: `Successfully disapproved submission of ${name}`,
          }
        }
      } else {
        return {
          error: 'Submission not found',
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return {
    error: 'Failed to disapprove submission'
  }
}
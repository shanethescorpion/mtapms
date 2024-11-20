'use server';;
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import FileDocument from "@app/models/FileDocument";
import Grantee from "@app/models/Grantee";
import { ActionResponseInterface, Semester, SubmissionStatus } from "@app/types";

async function uploadRequirement(fileDoc: File): Promise<string|undefined>
{
  try {
    const arrayBuffer = await fileDoc.arrayBuffer()
    const file = Buffer.from(arrayBuffer)
    const fileSubmission = await FileDocument.create({
      file,
      mimeType: fileDoc.type,
    })
    if (!!fileSubmission?._id) {
      return fileSubmission._id
    }
  } catch (e) {
    console.log(e)
  }
  return undefined
}

export async function uploadSubmission(requirementKey: string, academicYear: string|number, semester: Semester, formData: FormData): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!!session?.user?._id) {
      const studentId = session.user._id
      const file = formData.get('file') as File
      if (!!file) {
        const photo = await uploadRequirement(file)
        if (!!photo) {
          // find if grantee submission is available for this student and semester
          const submission = await Grantee.findOne({ studentId, academicYear, semester }).exec()
          if (!!submission?._id) {
            if (!submission[requirementKey]) {
              submission.set(requirementKey, {
                photo,
                status: SubmissionStatus.Pending
              })
            } else {
              submission[requirementKey].photo = photo
              submission.status = SubmissionStatus.Pending
            }
            const updated = await submission.save({ new: true, runValidators: true })
            if (!!updated?._id) {
              return {
                success: 'Requirement submitted',
              }
            } else {
              await FileDocument.findByIdAndDelete(photo).exec()
            }
          } else {
            await FileDocument.findByIdAndDelete(photo).exec()
          }
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to upload submission',
  }
}
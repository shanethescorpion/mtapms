'use server';
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import FileDocument from "@app/models/FileDocument";
import RequirementSubmission from "@app/models/RequirementSubmission";
import Student from "@app/models/Student";
import { ActionResponseInterface, SubmissionStatus } from "@app/types";

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

export async function uploadSubmission(requirementId: string, formData: FormData): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!!session?.user?._id) {
      const submittedBy = session.user._id
      const file = formData.get('file') as File
      if (!!file) {
        const photo = await uploadRequirement(file)
        if (!!photo) {
          // find if submission already exists
          const submission = await RequirementSubmission.findOne({ requirementId, submittedBy }).exec()
          if (!submission?._id) {
            const subm = await RequirementSubmission.create({
              photo,
              requirementId,
              status: SubmissionStatus.Pending,
              submittedBy
            })
            if (!!subm?._id) {
              const updated = await Student.updateOne({ _id: submittedBy }, { $push: { applicationSubmission: subm._id.toHexString() } }, { upsert: false, runValidators: true }).exec()
              if (updated.acknowledged && updated.modifiedCount > 0) {
                return {
                  success: 'Requirement submitted',
                }
              } else {
                await RequirementSubmission.findByIdAndDelete(submission._id).exec()
                await FileDocument.findByIdAndDelete(photo).exec()
              }
            } else {
              await FileDocument.findByIdAndDelete(photo).exec()
            }
          } else {
            submission.photo = photo
            submission.status = SubmissionStatus.Pending
            const updated = await submission.save({ new: true, runValidators: true })
            if (updated?.photo === photo) {
              return {
                success: 'Requirement submitted',
              }
            } else {
              await FileDocument.findByIdAndDelete(photo).exec()
            }
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
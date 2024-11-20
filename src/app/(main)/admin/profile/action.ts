'use server';
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Admin from "@app/models/Admin";
import FileDocument from "@app/models/FileDocument";
import { ActionResponseInterface } from "@app/types";

async function fileToBuffer(file: File): Promise<Buffer>
{
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer
}

async function savePhotoToDatabase(photo: File, userId: string): Promise<boolean>
{
  let photoFile = null
  try {
    photoFile = await FileDocument.create({
      file: await fileToBuffer(photo),
      mimeType: photo.type,
    })
  } catch (e) {}
  try {
    if (!!photoFile?._id) {
      const updatedUser = await Admin.updateOne({_id: userId }, { photo: photoFile._id }, { upsert: false, runValidators: true }).exec()
      if (updatedUser.acknowledged && updatedUser.modifiedCount > 0) {
        // success
        return true
      }
      // delete old photo if it exists
      if (!!photoFile && !!photoFile._id) {
        await FileDocument.findByIdAndDelete(photoFile._id)
      }
    }
  } catch (e) {
    console.log(e)
  }
  return false
}

export async function uploadPhoto(prevPhoto: string, formData: FormData): Promise<ActionResponseInterface>
{
  await mongodbConnect()
  try {
    const session = await getSession()
    if (!session?.user?._id) {
      return {
        error: 'Unauthorized',
      }
    }
    const photo = formData.get('photo')
    // save photo to database
    if (!!photo) {
      const uploaded = await savePhotoToDatabase(photo as File, session.user._id)
      console.log('photo uploaded:', uploaded)
      if (uploaded) {
        if (!!prevPhoto) {
          await FileDocument.findByIdAndDelete(prevPhoto)
        }
        return {
          success: 'Profile Photo changed successfully',
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to upload photo',
  }
}
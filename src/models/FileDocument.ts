import 'server-only';

import { FileDocumentModel, MimeTypes } from '@app/types';
import { model, models, Schema } from 'mongoose';


const FileDocumentSchema = new Schema<FileDocumentModel>({
  file: {
    type: Buffer,
    required: [true, 'Photo/File is required'],
  },
  mimeType: {
    type: String,
    enum: MimeTypes,
    required: [true, 'Mime Type is required'],
  },
}, {
  timestamps: true
})

export default models?.FileDocument || model<FileDocumentModel>('FileDocument', FileDocumentSchema)

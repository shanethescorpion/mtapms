import 'server-only';

import { RequirementSubmissionModel, SubmissionStatus } from '@app/types';
import { model, models, Schema } from 'mongoose';


const RequirementSubmissionSchema = new Schema<RequirementSubmissionModel>({
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: [true, 'Photo/File is required'],
  },
  status: {
    type: String,
    enum: SubmissionStatus,
  },
  requirementId: {
    type: Schema.Types.ObjectId,
    ref: 'Requirement',
    required: [true, 'Requirement Id is required.']
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'name for the first year requirement is required.'],
  },
}, {
  timestamps: true
})

RequirementSubmissionSchema.index({ requirementId: 1, submittedBy: 1 }, { unique: true })

export default models?.RequirementSubmission || model<RequirementSubmissionModel>('RequirementSubmission', RequirementSubmissionSchema)

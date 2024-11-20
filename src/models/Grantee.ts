import 'server-only';

import { GranteeModel, Semester, SubmissionProps, SubmissionStatus } from '@app/types';
import { model, models, Schema } from 'mongoose';


const GranteeRequirement = new Schema<SubmissionProps>({
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  status: {
    type: String,
    enum: SubmissionStatus,
    default: SubmissionStatus.Pending,
  }
}, { timestamps: true });

const GranteeSchema = new Schema<GranteeModel>({
  studentId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Student ID is required'],
  },
  academicYear: {
    type: Number,
    minLength: 2020,
    maxLength: 2050,
    required: [true, 'Academic Year is required'],
  },
  semester: {
    type: Number,
    enum: Semester,
    required: [true, 'Semester is required'],
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
  },
  COG: GranteeRequirement,
  studyLoad: GranteeRequirement,
  statementOfAccount: GranteeRequirement,
  CONS: GranteeRequirement,
}, {
  timestamps: true
})

GranteeSchema.index({ studentId: 1, academicYear: 1, semester: 1 }, { unique: true })

export default models?.Grantee || model<GranteeModel>('Grantee', GranteeSchema)

import 'server-only';

import { RequirementModel } from '@app/types';
import { model, models, Schema } from 'mongoose';


const RequirementSchema = new Schema<RequirementModel>({
  scheduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule Id is required.'],
  },
  name: {
    type: String,
    required: [true, 'name for the requirement is required.'],
  },
  description: String,
  forFirstYearOnly: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
})

RequirementSchema.index({ scheduleId: 1, name: 1, forFirstYearOnly: 1 }, { unique: true })

export default models?.Requirement || model<RequirementModel>('Requirement', RequirementSchema)

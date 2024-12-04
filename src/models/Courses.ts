import 'server-only';

import { model, models, Schema } from 'mongoose';
import { CoursesModel } from '@app/types';


const CoursesSchema = new Schema<CoursesModel>({
  name: {
    type: String,
    required: [true, "Course Name is Required"],
    unique: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, "Admin Required"]
  }
}, {
  timestamps: true
})


export default models?.Courses || model<CoursesModel>('Courses', CoursesSchema)

import 'server-only';

import { hashPassword } from '@app/lib/hash';
import { AdminModel } from '@app/types';
import { model, models, Schema } from 'mongoose';


const AdminSchema = new Schema<AdminModel>({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  firstName: {
    type: String,
    required: [true, 'First Name is required']
  },
  middleName: String,
  lastName: {
    type: String,
    required: [true, 'Last Name is required']
  },
  photo: {
    type: Schema.Types.ObjectId,
    ref: 'FileDocument',
    default: null
  }
}, {
  timestamps: true
})

AdminSchema.pre('save', function (next: any) {
  const admin = this;
  if (this.isModified('password') || this.isNew) {
    hashPassword(admin.password, (hashErr, hash) => {
      if (hashErr) {
        return next(hashErr)
      }
      admin.password = hash
      next()
    })
  } else {
    return next()
  }
})

export default models?.Admin || model<AdminModel>('Admin', AdminSchema)
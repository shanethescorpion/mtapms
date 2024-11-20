import 'server-only';

import { AccountRecoveryModel, SecretQuestions1, SecretQuestions2 } from '@app/types';
import { model, models, Schema } from 'mongoose';

const AccountRecoverySchema = new Schema<AccountRecoveryModel>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User Required"],
    unique: [true, "User must be unique"]
  },
  secretQ: {
    type: String,
    enum: SecretQuestions1,
    required: [true, "Secret Question 1 Required"],
  },
  secretA: {
    type: String,
    required: [true, "Secret Answer 1 Required"],
  },
  secretQ2: {
    type: String,
    enum: SecretQuestions2,
    required: [true, "Secret Question 2 Required"],
  },
  secretA2: {
    type: String,
    required: [true, "Secret Answer 2 Required"],
  },
}, {
  timestamps: true
})

export default models?.AccountRecovery || model<AccountRecoveryModel>('AccountRecovery', AccountRecoverySchema)

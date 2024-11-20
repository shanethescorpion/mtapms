'use server'

import mongodbConnect from "@app/lib/db";
import { compare } from "@app/lib/hash";
import { createSession } from "@app/lib/session";
import AccountRecovery from "@app/models/AccountRecovery";
import Admin from "@app/models/Admin";
import Student from "@app/models/Student";
import { AccountRecoveryModel, ActionResponse, Roles, SecretQuestions1, SecretQuestions2, StudentModel } from "@app/types";

export interface ResponseAction {
  success?: boolean;
  error?: {
    [key: string]: string;
  }
}

async function adminLogin(employeeId?: string, password?: string): Promise<ResponseAction> {
  await mongodbConnect();
  if (!employeeId ||!password) {
    return {
      success: false,
      error: {
        login: 'All fields are required'
      }
    }
  }
  const admin = await Admin.findOne({ employeeId }).select('password').lean().exec() as StudentModel;
  if (admin && (await compare(password, admin.password))) {
    const success = await createSession(Roles.Admin, admin._id!);
    let error = !success ? undefined : { login: 'Session failed. Please try again later or refresh page.' };
    return {
      success,
      error
    }
  }
  return {
    success: false,
    error: {
      login: 'Invalid Credentials'
    }
  }
}

async function studentLogin(email?: string, password?: string): Promise<ResponseAction> {
  await mongodbConnect();
  if (!email ||!password) {
    return {
      success: false,
      error: {
        login: 'All fields are required'
      }
    }
  }
  const student = await Student.findOne({ email }).select('password isGrantee').exec();
  if (student && (await compare(password, student.password))) {
    // create session
    const role = student.isGrantee ? Roles.Grantee : Roles.Applicant;
    const success = await createSession(role, student._id);
    let error = !success ? undefined : { login: 'Session failed. Please try again later or refresh page.' };
    return {
      success,
      error
    }
  }
  return {
    success: false,
    error: {
      login: 'Invalid Credentials'
    }
  }
}

export async function loginAction(prevState: ResponseAction, formData: FormData): Promise<ResponseAction> {
  if (prevState?.success) {
    return {
      success: false,
      error: {
        login: 'Previous login attempt failed. Please try again later or refresh page.'
      }
    }
  }

  const { loginas, email, employeeId, password } = Object.fromEntries(formData.entries());
  switch (loginas) {
    case 'admin': {
      return await adminLogin(employeeId as string|undefined, password as string|undefined);
    }
    case'student': {
      return await studentLogin(email as string|undefined, password as string|undefined);
    }
    default: {
      return {
        success: false,
        error: {
          login: 'Invalid login type'
        }
      }
    }
  }
}


export async function signupAction(prevState: ActionResponse, formData: any): Promise<ActionResponse> {
  if (prevState?.success) {
    return {
      error: 'Previous sign up attempt failed. Please try again later or refresh page.'
    }
  }
  await mongodbConnect()
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const sq1 = formData.get('sq1') as SecretQuestions1
    const sa1 = formData.get('sa1') as string
    const sq2 = formData.get('sq2') as SecretQuestions2
    const sa2 = formData.get('sa2') as string
    if (!email) {
      return {
        error: 'Missing email'
      }
    }
    if (!password) {
      return {
        error: 'Missing password'
      }
    }
    if (!confirmPassword || password !== confirmPassword) {
      return {
        error: 'Password does not match'
      }
    }
    if (!sq1 || !sq2 || !sa1 || !sa2) {
      return {
        error: 'Missing security questions or answers'
      }
    }
    const student = await Student.exists({ email }).exec()
    if (student) {
      return {
        error: 'Email already registered'
      }
    }
    console.log({ email, password })
    const newStudent = await Student.create({ email, password })
    if (!!newStudent?._id) {
      // create account recovery
      await AccountRecovery.create({
        userId: newStudent._id.toString(),
        secretQ: sq1,
        secretA: sa1,
        secretQ2: sq2,
        secretA2: sa2,
      })
      return {
        success: 'Successfully signed up',
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to sign up. Please try again.',
  }
}


export async function forgotAction(prevState: ActionResponse, formData: any): Promise<ActionResponse & { email?: string, arId?: string, sq1?: string, sq2?: string }> {
  if (prevState?.success) {
    return {
      error: 'Previous submission failed. Please try again later or refresh page.'
    }
  }
  await mongodbConnect()
  try {
    const email = formData.get('email') as string
    if (!email) {
      return {
        error: 'Missing email'
      }
    }
    const student = await Student.exists({ email }).exec()
    if (!student) {
      return {
        error: 'Account not registered'
      }
    }
    const ar = await AccountRecovery.findOne({ userId: student._id.toString() }).lean<AccountRecoveryModel>().exec();
    if (!!ar) {
      return {
        success: "Success",
        email,
        arId: ar?._id?.toString(),
        sq1: ar?.secretQ,
        sq2: ar?.secretQ2,
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to sign up. Please try again.',
  }
}

export async function verifyForgotAction(email: string, arId: string, prevState: ActionResponse, formData: any): Promise<ActionResponse> {
  if (prevState?.success) {
    return {
      error: 'Previous submission failed. Please try again later or refresh page.'
    }
  }
  await mongodbConnect()
  try {
    console.log(email, arId, prevState, formData);
    const sa1 = formData.get('sa1') as string
    const sa2 = formData.get('sa2') as string
    if (!email) {
      return {
        error: 'Missing email'
      }
    }
    if (!arId) {
      return {
        error: 'Bad Request'
      }
    }
    if (!sa1 || !sa2) {
      return {
        error: 'Missing Secret Answers'
      }
    }
    const student = await Student.exists({ email }).exec()
    if (!student) {
      return {
        error: 'Account not registered'
      }
    }
    const ar = await AccountRecovery.findOne({ userId: student._id.toString() }).lean<AccountRecoveryModel>().exec();
    if (!!ar) {
      if (ar.secretA === sa1 && ar.secretA2 === sa2) {
        return {
          success: 'Successfully verified',
        }
      } else {
        return {
          error: 'Failed. Incorrect Answers.'
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to verify security questions. Please try again later.',
  }
}

export async function changePasswordAction(email: string, prevState: ActionResponse, formData: any): Promise<ActionResponse> {
  if (prevState?.success) {
    return {
      error: 'Previous submission failed. Please try again later or refresh page.'
    }
  }
  await mongodbConnect()
  try {
    const password = formData.get('password') as string
    if (!email) {
      return {
        error: 'Missing email'
      }
    }
    if (!password) {
      return {
        error: 'Missing Password'
      }
    }
    const student = await Student.findOne({ email }).exec()
    if (!student) {
      return {
        error: 'Account not registered'
      }
    }
    student.password = password
    await student.save()
    return {
      success: 'Successfully changed password',
    }
  } catch (e) {
    console.log(e)
  }
  return {
    error: 'Failed to sign up. Please try again.',
  }
}
'use server'
import mongodbConnect from '@app/lib/db';
import Admin from '@app/models/Admin';
import Student from '@app/models/Student';
import { Roles } from '@app/types';
import { type JWTPayload, SignJWT, jwtVerify } from 'jose';
import moment from 'moment-timezone';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: { [key: string]: any }, hours: number = 8) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${hours}h`)
    .sign(encodedKey)
}

export async function decrypt(session?: string): Promise<JWTPayload | { [key: string]: any } | null> {
  try {
    const { payload } = await jwtVerify(session || '', encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {}
  return null;
}

export async function generateSessionPayload(account: Roles, userId: string, expHours: number = 8) {
  await mongodbConnect();
  try {
    const AccountModel = account === Roles.Admin ? Admin : Student;
    const selectOnly = account === Roles.Admin ? '-password' : '-password -applicationForm -applicationSubmission';
    const acc = await AccountModel.findOne({ _id: userId }).select(selectOnly).lean().exec();
    if (acc) {
      const user = JSON.parse(JSON.stringify({...acc, role: account }));
      return {
        user,
        expiresAt: new Date(Date.now() + expHours * 60 * 60 * 1000)
      }
    }
  } catch (e) {}
  return null;
}

export async function createSession(role: Roles, userId: string, expHours: number = 8): Promise<boolean> {
  const payload = await generateSessionPayload(role, userId, expHours);
  if (!payload) {
    return false;
  }

  const session = await encrypt(payload, expHours)

  cookies().set('auth', session, {
    httpOnly: true,
    secure: true,
    expires: payload.expiresAt as Date,
    sameSite: 'lax',
    path: '/',
  })

  return true;
}

export async function getSession(): Promise<JWTPayload | { [key: string]: any } | null> {
  const cookie = cookies().get('auth')
  if (cookie && cookie.value) {
    const session = await decrypt(cookie.value)
    if (session && (Math.floor(Date.now() / 1000) > (session as any).exp)) {
      await destroySession()
      return null;
    }
    return session
  }
  return null;
}

export async function destroySession() {
  cookies().delete('auth')
  const expires = moment.tz('Asia/Manila').toDate()
  expires.setFullYear(1901, 1, 1)
  cookies().set('auth', '', {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession(role: Roles): Promise<boolean> {
  const session = await getSession();
  if (!!session?.user?._id) {
    const result = await createSession(role, session.user._id)
    return result;
  }
  return false;
}

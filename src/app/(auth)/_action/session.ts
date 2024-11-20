'use server'

import { getSession } from "@app/lib/session";

export async function isAuthenticated() {
  const session = await getSession()
  if (session) {
    return session.user.role
  }
  return false;
}
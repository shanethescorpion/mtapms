'use server'

import { getSession } from "@app/lib/session";
import { Roles } from "@app/types";

export async function isAuthenticated(): Promise<boolean>
{
  const session = await getSession();
  if (session?.user?.role === Roles.Applicant) {
    return true
  }
  return false
}
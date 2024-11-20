'use server';;
import mongodbConnect from "@app/lib/db";
import { getSession } from "@app/lib/session";
import Admin from "@app/models/Admin";
import { AdminModel, Roles } from "@app/types";
import { isObjectIdOrHexString } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type ParamProps = {
  params: {
    adminId: string
  }
}

export async function GET(request: NextRequest, { params: { adminId }}: ParamProps) {
  await mongodbConnect()
  try {
    const session = await getSession();
    if (session?.user?.role === Roles.Admin && isObjectIdOrHexString(adminId)) {
      const data = await  Admin.findById(adminId).select('employeeId firstName lastName photo').lean<AdminModel>().exec()
      return NextResponse.json({ data })
    }
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: null })
}
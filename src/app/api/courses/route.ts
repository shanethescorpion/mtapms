'use server'

import mongodbConnect from "@app/lib/db";
import Courses from "@app/models/Courses";
import { CoursesModel } from "@app/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await mongodbConnect()
  try {
    const courses = await Courses.find({}).lean<CoursesModel[]>().exec()
    return NextResponse.json({ data: courses })
  } catch (e) {
    console.log(e)
  }
  return NextResponse.json({ data: [] })
}
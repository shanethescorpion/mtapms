'use server'

import Grantee from "@app/models/Grantee";
import Student from "@app/models/Student";
import { GranteeModel } from "@app/types";
import mongodbConnect from "./db";

function sum(numbers: number[]): number {
  return numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}

export async function getGradeStatus(studentId?: string): Promise<string>
{
  await mongodbConnect();
  try {
    if (!!studentId) {
      const student = await Student.findOne({ _id: studentId }).exec();
      if (!!student && student.isGrantee) {
        const allSubmittedGranteeForms = await Grantee.find({ studentId: student._id.toString() }).lean<GranteeModel[]>().exec();
        const withGrades = allSubmittedGranteeForms.filter((gform) => !!gform.grade).map((gform) => Number.parseFloat(gform.grade!.toString()));
        return withGrades.length === 0 || (sum(withGrades) / withGrades.length) <= 3.0
          ? "Passed"
          : allSubmittedGranteeForms.filter((gform) => !!gform.grade && gform.grade > 3.0).length === 1
          ? "Warning"
          : "Failed";
      }
    }
  } catch (err) {
    console.error(err);
  }
  return "Passed";
}
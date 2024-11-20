import { ApplicationFormProps, StudentModel, YearLevel } from "@app/types"


export function displayFullName(student?: StudentModel & ApplicationFormProps & { age: number, studId: string }, firstNameFirst: boolean = false) {
  if (!student) return undefined
  if (!firstNameFirst) {
    return (`${student.lastName}, ${student.firstName} ` +  (student.middleName ? `${student.middleName}` : '')).trim()
  } else {
    return (`${student.firstName} ${student.middleName? `${student.middleName.charAt(0).toUpperCase()}.` : ''} ${student.lastName}`).trim()
  }
}

export function displayYearLevel(yr?: YearLevel) {
  return YearLevel.FirstYear === yr
  ? '1st Year'
  : YearLevel.SecondYear === yr
  ? '2nd Year'
  : YearLevel.ThirdYear === yr
  ? '3rd Year'
  : YearLevel.FourthYear === yr
  ? '4th Year'
  : undefined
}
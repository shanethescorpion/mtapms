import AccountRecovery from '@app/models/AccountRecovery';
import Admin from '@app/models/Admin';
import FileDocument from '@app/models/FileDocument';
import Grantee from '@app/models/Grantee';
import Requirement from '@app/models/Requirement';
import RequirementSubmission from '@app/models/RequirementSubmission';
import Schedule from '@app/models/Schedule';
import Student from '@app/models/Student';
import 'server-only';
import mongodbConnect from './db';


export default async function seed() {
  await mongodbConnect();
  // Seed Admin account
  const admin = await Admin.findOne({
    employeeId: '123'
  }).exec();
  if (!admin) {
    try {
      const newAdmin = await Admin.create({
        employeeId: '123',
        password: 'password',
        firstName: 'Erika Shane',
        middleName: '',
        lastName: 'Labor'
      });
    } catch (e) {
      console.log("admin error:", e)
    }
  }
  await FileDocument.countDocuments();
  await Requirement.countDocuments();
  await RequirementSubmission.countDocuments();
  await Student.countDocuments();
  await AccountRecovery.countDocuments();
  await Schedule.countDocuments();
  await Grantee.countDocuments();
  // // Seed Student applicant account
  // const applicant = await Student.findOne({
  //   email: 'applicant_test@gmail.com'
  // }).exec();
  // if (!applicant) {
  //   try {
  //     const newStudent = await Student.create({
  //       email: 'applicant_test@gmail.com',
  //       password: 'password',
  //       emailVerified: moment.tz('Asia/Manila').toDate(),
  //     });
  //   } catch (e) {
  //     console.log("student error:", e)
  //   }
  // }
  //
  // // seed schedule
  // const schedule = await Schedule.find({});
  // let scheduleId = null;
  // let thisYearScheduleId = null;
  // if (schedule.length === 0) {
  //   try {
  //     const lastYear = moment.tz('Asia/Manila').toDate()
  //     lastYear.setHours(0,0,0,0)
  //     lastYear.setFullYear(lastYear.getFullYear() - 1)
  //     const end = moment(lastYear).tz('Asia/Manila').toDate()
  //     end.setHours(0,0,0,0)
  //     end.setMonth(end.getMonth() + 1)
  //     const examDate = moment(lastYear).tz('Asia/Manila').toDate()
  //     examDate.setHours(8,0,0,0)
  //     examDate.setDate(examDate.getDate() + 3)
  //     const interviewDate = moment(examDate).tz('Asia/Manila').toDate()
  //     interviewDate.setHours(10,0,0,0)
  //     interviewDate.setDate(interviewDate.getDate() + 2)
  //     const newSchedule = await Schedule.create({
  //       academicYear: lastYear.getFullYear(),
  //       range: {
  //         startDate: lastYear,
  //         endDate: end,
  //       },
  //       orientationDate: examDate,
  //       examDate: examDate,
  //       interviewDate: interviewDate,
  //       scholarshipSlots: 2,
  //       createdAt: lastYear,
  //       updatedAt: lastYear,
  //     })
  //     scheduleId = newSchedule._id.toHexString();
  //     // this year
  //     try {
  //       const now = moment.tz('Asia/Manila').toDate()
  //       now.setHours(0,0,0,0)
  //       const endNow = moment(now).tz('Asia/Manila').toDate()
  //       endNow.setHours(0,0,0,0)
  //       endNow.setMonth(endNow.getMonth() + 1)
  //       const orientationDate = moment(now).tz('Asia/Manila').toDate()
  //       orientationDate.setHours(8,0,0,0)
  //       const examDate2 = moment(orientationDate).tz('Asia/Manila').toDate()
  //       examDate2.setHours(8,0,0,0)
  //       const interviewDate2 = moment(examDate2).tz('Asia/Manila').toDate()
  //       interviewDate2.setDate(interviewDate2.getDate() + 1)
  //       interviewDate2.setHours(9,0,0,0)
  //       const thisYear = await Schedule.create({
  //         academicYear: now.getFullYear(),
  //         range: {
  //           startDate: now,
  //           endDate: endNow,
  //         },
  //         orientationDate: orientationDate,
  //         examDate: examDate2,
  //         interviewDate: interviewDate2,
  //         scholarshipSlots: 25,
  //       })
  //       thisYearScheduleId = thisYear._id.toHexString();
  //     } catch (err) {
  //       console.log("thisyear", err)
  //     }
  //   } catch (e) {
  //     console.log("schedule error:", e)
  //   }
  // }
  // // Seed Requirement
  // let requirementId = null
  // if (!!scheduleId) {
  //   const req = await Requirement.findOne({
  //     scheduleId: scheduleId,
  //   });
  //   if (!req) {
  //     try {
  //       const newReq = await Requirement.create({
  //         scheduleId: scheduleId,
  //         name: 'Form 138',
  //         description: 'Upload a photo of your Form 138. Please ensure that your photo is clear and legible.',
  //         forFirstYearOnly: true,
  //       })
  //       requirementId = newReq._id.toHexString();
  //     } catch (e) {
  //       console.log("requirement error:", e)
  //     }
  //   }
  // }

  // // Seed Student grantee account
  // const grantee = await Student.findOne({
  //   email: 'grantee_test@gmail.com'
  // }).exec();

  // if (!grantee) {
  //   try {
  //     const newGrantee = await Student.create({
  //       email: 'grantee_test@gmail.com',
  //       password: 'password',
  //       emailVerified: (moment.tz('Asia/Manila').toDate()),
  //       isGrantee: false,
  //       applicationForm: {
  //         scheduleId,
  //         lastName: 'Test',
  //         firstName: 'Grantee',
  //         dateOfBirth: '2004-07-01',
  //         placeOfBirth: 'Nasipit',
  //         permanentAddress: 'Nasipit',
  //         zipCode: 8602,
  //         province: 'Agusan del Norte',
  //         presentAddress: 'Nasipit',
  //         sex: Gender.Female,
  //         civilStatus: CivilStatus.Single,
  //         citizenship: 'Filipino',
  //         mobileNo: '09624235656',
  //         nameOfSchoolAttended: 'SMCC',
  //         schoolAddress: 'Nasipit',
  //         schoolSector: SchoolSector.Private,
  //         yearLevel: YearLevel.FirstYear,
  //         course: 'Computer Science',
  //         fatherLiving: false,
  //         motherLiving: true,
  //         motherName: 'Mrs. Clara Grantee',
  //         motherAddress: 'Nasipit',
  //         motherOccupation: 'House wife',
  //         totalParentGrossIncome: 30000,
  //         siblings: 2,
  //         otherEducationalFinancialAssistance: false
  //       }
  //     });
  //     if (!!newGrantee?._id) {
  //       try {
  //         const attendance = await Schedule.findById(scheduleId).exec()
  //         const lastYear = moment.tz('Asia/Manila').toDate()
  //         lastYear.setHours(8,0,0,0)
  //         lastYear.setFullYear(lastYear.getFullYear() - 1)
  //         const examDate = moment(lastYear).tz('Asia/Manila').toDate()
  //         examDate.setHours(8,0,0,0)
  //         examDate.setDate(examDate.getDate() + 5)
  //         const submitDate = moment(examDate).tz('Asia/Manila').toDate()
  //         submitDate.setHours(8,0,0,0)
  //         submitDate.setDate(submitDate.getDate() +  15)
  //         attendance.orientationAttendance.push({ studentId: newGrantee._id.toHexString(), createdAt: lastYear, updatedAt: lastYear })
  //         attendance.examScores.push({ studentId: newGrantee._id.toHexString(), percentageScore: 94.24, createdAt: examDate, updatedAt: examDate })
  //         await attendance.save({ runValidators: true })
  //         const submissionPhoto = await FileDocument.create(await getImageBufferSample())
  //         const submission = await RequirementSubmission.create({
  //           requirementId,
  //           submittedBy: newGrantee._id.toHexString(),
  //           photo: submissionPhoto._id.toHexString(),
  //           status: SubmissionStatus.Approved,
  //           createdAt: submitDate,
  //           updatedAt: submitDate
  //         })
  //         newGrantee.applicationSubmission.push(submission._id.toHexString())
  //         const saved = await newGrantee.save({ runValidators: true })
  //         saved.isGrantee = true
  //         const grant = await saved.save({ runValidators: true })
  //         console.log('grantee created:', grant?._id?.toHexString())
  //         const granteeSubmission = await Grantee.create({
  //           studentId: grant?._id?.toHexString(),
  //           academicYear: (moment.tz('Asia/Manila').toDate()).getFullYear(),
  //           semester: Semester.FirstSemester,
  //         })
  //         console.log('grantee submission created', granteeSubmission?._id?.toHexString())
  //       } catch (e) {
  //         console.log("error", e)
  //       }
  //     }
  //   } catch (e) {
  //     console.log("grantee error:", e)
  //   }
  // }
}
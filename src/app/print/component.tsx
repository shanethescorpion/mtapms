'use client';;
import { displayFullName, displayYearLevel } from "@app/components/display";
import { ApplicationFormProps, SchoolSector, StudentModel } from "@app/types";
import { Gender } from '@app/types/index';
import { CheckIcon } from "@heroicons/react/16/solid";
import moment from "moment-timezone";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Print({ template, data, viewOnly = false, ...props }: { template: string, data: any, viewOnly?: boolean } & any) {
  const img1 = useRef<HTMLImageElement>(null)
  const img2 = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (!viewOnly) {
      if (img1.current && img2.current) {
        const timeout = setTimeout(() => {
          window.print()
          window.history.back()
          window.close()
        }, 500)
        return () => clearTimeout(timeout)
      }
    }
  }, [viewOnly])
  if (template === 'application') {
    const studentData: StudentModel & ApplicationFormProps & { studentId: string } = data
    return (
    <div className="w-[8.5in] min-h-[13in] bg-white text-black text-[11pt] font-sans">
      {/* Header */}
      <div className="grid grid-cols-3 items-center pb-2 w-full bg-white">
        <Image ref={img1} width={1000} height={1000} loading="eager" src="/municipal-logo.svg" alt="Logo 1" className="w-20 h-20 mx-auto" />
        <div className="text-center">
          <p>The Republic of the Philippines</p>
          <p>Province of Agusan del Norte</p>
          <p>Municipality of Buenavista</p>
          <p className="font-bold">Office of the Municipal Mayor</p>
        </div>
        <Image ref={img2} width={1000} height={1000} loading="eager" src="/bagong-pilipinas-logo.svg" alt="Logo 2" className="w-24 h-24 translate-y-1 mx-auto" />
      </div>

      {/* Title */}
      <div className="text-center mt-1">
        <p className="font-semibold text-[10pt]">THRU: LGU SCHOLARSHIP OFFICE</p>
        <p className="font-bold">APPLICATION FORM</p>
      </div>

      {/* Application Form */}
      <div className="border border-black text-[10pt]">
        <div className="grid grid-cols-5 border-collapse">
          <div className="border px-1 row-span-2"><div className="flex h-full items-center">Name</div></div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.lastName}</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.firstName}</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.middleName}</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.maidenName}</div>
          <div className="border px-1 text-center text-[8pt]">(Last Name)</div>
          <div className="border px-1 text-center text-[8pt]">(First Name)</div>
          <div className="border px-1 text-center text-[8pt]">(Middle Name)</div>
          <div className="border px-1 text-center text-[6pt]">(Maiden Name for Married Women)</div>

          <div className="border px-1 row-span-2"><div className="flex h-full items-center">Date of Birth</div></div>
          <div className="border px-1 row-span-2 font-[500] text-wrap break-words"><div className="flex h-full items-center">{moment(studentData?.dateOfBirth).tz('Asia/Manila').toDate()?.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</div></div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.permanentAddress}</div>
          <div className="border px-1 text-center font-[500] text-wrap break-words">{studentData?.zipCode}</div>
          <div className="border px-1 col-span-2 text-center">Permanent Address</div>
          <div className="border px-1 text-center">Zip Code</div>

          <div className="border px-1 row-span-2"><div className="flex h-full items-center">Place of Birth</div></div>
          <div className="border px-1 row-span-2 font-[500] text-wrap break-words"><div className="flex h-full items-center">{studentData?.placeOfBirth}</div></div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.presentAddress}</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.province}</div>
          <div className="border px-1 col-span-2 text-center">Present Address</div>
          <div className="border px-1 text-center">Province</div>

          <div className="border px-1">Sex</div>
          <div className="border px-1 flex">
            <div>({studentData?.sex === Gender.Male ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Male</div>
            <div className="ml-2">({studentData?.sex === Gender.Female ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Female</div>
          </div>
          <div className="border px-1 text-[9pt]">Name of School Attended</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.nameOfSchoolAttended}</div>

          <div className="border px-1">Status</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.civilStatus}</div>
          <div className="border px-1">School Address</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.schoolAddress}</div>

          <div className="border px-1">Citizenship</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.citizenship}</div>
          <div className="border px-1">School Sector</div>
          <div className="border px-1 flex text-[9pt]">
            <div>({studentData?.schoolSector === SchoolSector.Public ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Public</div>
            <div className="ml-2">({studentData?.schoolSector === SchoolSector.Private ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Private</div>
          </div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.tribalMembership}</div>

          <div className="border px-1">Mobile Number</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.mobileNo}</div>
          <div className="border px-1">Year Level: {displayYearLevel(studentData?.yearLevel)}</div>
          <div className="border px-1">Course: {studentData?.course}</div>
          <div className="border px-2 text-center text-[9px]">Tribal Membership (if applicable)</div>

          <div className="border px-1">E-mail Address</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words text-[10pt]">{studentData?.email}</div>
          <div className="border px-1 text-[9pt]">Type of Disability <br />(if applicable)</div>
          <div className="border px-1 font-[500] text-wrap break-words">{studentData?.typeOfDisability}</div>
        </div>
      </div>

      {/* Family Background */}
      <div className="mt-1 text-[10pt]">
        <div className="text-center font-bold text-[11pt]">FAMILY BACKGROUND</div>
        <div className="grid grid-cols-5 gap-px border border-black">
          <div></div>
          <div className="border px-1 text-center col-span-2">Father: ({studentData?.fatherLiving ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Living ({!studentData?.fatherLiving ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Deceased</div>
          <div className="border px-1 text-center col-span-2">Mother: ({studentData?.motherLiving ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Living ({!studentData?.motherLiving ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Deceased</div>

          <div className="border px-1">Name</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.fatherName}</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.motherName}</div>

          <div className="border px-1">Address</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.fatherAddress}</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.motherAddress}</div>

          <div className="border px-1">Occupation</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.fatherOccupation}</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.motherOccupation}</div>

          <div className="border px-1">Total Parents Gross Income</div>
          <div className="border px-1 col-span-2 font-[500] text-wrap break-words">{studentData?.totalParentGrossIncome?.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</div>
          <div className="border px-1 col-span-2 row-span-2"><div className="flex h-full items-center">No. of Siblings in the Family: <span className="font-[500] text-wrap break-words ml-2">{studentData?.siblings}</span></div></div>
          <div className="border px-1 col-span-3 text-[10pt]">Are you enjoying other educational financial assistance? ({studentData?.otherEducationalFinancialAssistance ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) Yes ({!studentData?.otherEducationalFinancialAssistance ? <CheckIcon className="w-4 h-4 inline"/> : <>&nbsp;&nbsp;</>}) No</div>
        </div>
      </div>

      {/* Qualification */}
      <div className="border-t pt-1 text-[8pt] leading-tight">
        <div className="text-center font-bold">QUALIFICATION</div>
        <p className="text-center">Municipal Ordinance No. 39-2017</p>
        <p className="text-center">Series of 2017</p>
        <div className="mt-1">
          <p className="font-semibold">Section 1. SHORT TITLE. <span className="font-normal">- This ordinance shall be known as the Tertiary Scholarship Program Act of 2017.</span></p>
          <p className="font-semibold mt-1">Section 2. MUNICIPAL POLICY. <span className="font-normal">- It is hereby declared to be the policy of the Municipality of Buenavista, Agusan del Norte, that, to promote social justice, it is but necessary for the local government unit to assist the poor or marginalized students of the locality the access to quality education. Toward this end, it shall provide mechanisms that will help these students earn their college education through a tertiary scholarship program sponsored and aggressively undertaken by the municipality.</span></p>
          <p className="font-semibold mt-1">Section 3. COVERAGE. <span className="font-normal">- The Tertiary Scholarship Program authorized under this Ordinance shall apply only to students who are qualified for promotion to college after earning their secondary education from recognized institutions of learning.</span></p>
          <p className="font-semibold mt-1">Section 4. PURPOSE. <span className="font-normal">- The Buenavista Tertiary Scholarship Program Act of 2017 seeks to extend financial assistance to poor or marginalized students of post-secondary education thereby giving them the opportunity to enroll in recognized schools, colleges or universities anywhere in Mindanao by taking up four or five-year degree courses of their choice, which when completed, may become a tool to gain greener pastures to alleviate their families out of poverty and thus contribute to national development.</span></p>
        </div>
        <div className="text-center font-bold mt-1">DOCUMENTARY REQUIREMENTS</div>
        <p className="text-center">Municipal Ordinance No. 30-2017</p>
        <p className="text-center">Series of 2017</p>
        <div className="mt-1">
          <p className="font-semibold">Section 7. REQUIREMENTS FOR ADMISSION. <span className="font-normal">- The following requirements shall take precedence for a student to be able to avail of the Buenavista Tertiary scholarship Program Act of 2017, as follows:</span></p>
          <p className="font-semibold mt-1">(1) <span className="font-normal">The applicant must be a citizen of the Republic of the Philippines;</span></p>
          <p className="font-semibold mt-1">(2) <span className="font-normal">He/she must be a bona fide resident of the Municipality of Buenavista, Agusan del Norte, as certified by the Punong Barangay of the barangay where he/she resides;</span></p>
          <p className="font-semibold mt-1">(3) <span className="font-normal">He/she must be of good moral character with no criminal record as certified by the Guidance Counselor of the school where he/she graduated; provided, however, that this requirement may be waived for programs which target children in conflict with the laws and/or those who are undergoing or have undergone rehabilitation, pursuant to Republic Act No. 9344, otherwise known as the {"\"Juvenile Justice and Welfare Act of 2006\""};</span></p>
          <p className="font-semibold mt-1">(4) <span className="font-normal">He/she must submit a Medical Certificate issued by a Medical Doctor;</span></p>
          <p className="font-semibold mt-1">(5) <span className="font-normal">The applicant may fall either in the category of the definition of {"\"poor student\""} or {"\"marginalized student\""} of numbers 1 and 6 of Section 5 hereof, through the certifications of the Punong Barangay of the barangay where he/she resides and the Municipal Social Welfare and Development Officer of the Municipality of Buenavista, Agusan del Norte; and</span></p>
          <p className="font-semibold mt-1">(6) <span className="font-normal">The applicant must be a high school graduate of any recognized high school in the locality or adjoining city or municipalities of Agusan del Norte, as evidence his/her School Card (FORM 138).</span></p>
        </div>
        <div className="mt-2">
          <p>I hereby certify that foregoing statements are true and correct.</p>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center text-xs">
        {/* Signature Section */}
        <div className="w-full">
          <div className="mx-auto w-64">
            <div className="text-center w-64 uppercase font-[500]">{displayFullName(studentData as any, true)}</div>
            <p className="text-center mt-1 border-t border-black w-64">Signature over Printed Name of Applicant</p>
          </div>
        </div>
        {/* Date Section */}
        <div className="w-full">
          <div className="mx-auto w-64">
            <div className="text-center w-64">{moment(studentData?.updatedAt!).tz('Asia/Manila').toDate()?.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <p className="text-center mt-1 border-t border-black w-64">Date Accomplished</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {/* Instruction Text */}
        <p className="text-center text-[8pt] mx-auto">
          Note: Fully accomplished form to be submitted to the Scholarship office.
        </p>
      </div>
    </div>
    )
  } else if (template === 'application-list' || template === 'grantees-list') {
    const listData: { applicants?: StudentModel[], grantees?: StudentModel[], oldGrantees?: StudentModel[], academicYear: string } = data
    return (
    <div className="w-[8.5in] min-h-[13in] bg-white text-black text-[11pt] font-sans">
      {/* Header */}
      <div className="grid grid-cols-3 items-center pb-2 w-full bg-white">
        <Image ref={img1} width={1000} height={1000} loading="eager" src="/municipal-logo.svg" alt="Logo 1" className="w-20 h-20 mx-auto" />
        <div className="text-center">
          <p>The Republic of the Philippines</p>
          <p>Province of Agusan del Norte</p>
          <p>Municipality of Buenavista</p>
          <p className="font-bold">Office of the Municipal Mayor</p>
        </div>
        <Image ref={img2} width={1000} height={1000} loading="eager" src="/bagong-pilipinas-logo.svg" alt="Logo 2" className="w-24 h-24 translate-y-1 mx-auto" />
      </div>

      {/* Table List */}
      <table className="border-collapse w-full">
        <thead>
          <tr>
            <th colSpan={3} className="text-center text-[14pt] border-t border-x border-black">
              LIST OF {Array.isArray(listData.applicants) ? "APPLICANTS" : "RECIPIENTS"} OF THE LGU SCHOLARSHIP PROGRAM
            </th>
          </tr>
          <tr>
            <th colSpan={3} className="text-center text-[14pt] border-b border-x border-black">
              {listData.academicYear}
            </th>
          </tr>
          <tr>
            <th className="border border-black px-1">
              &nbsp;
            </th>
            <th className="border border-black text-left px-1">
              NAME
            </th>
            <th className="border border-black text-left px-1">
              ADDRESS
            </th>
          </tr>
        </thead>
        <tbody>
          {listData.applicants?.map((stud, n: number) => (
            <tr key={stud._id}>
              <td className="text-right min-w-[15px] border border-black px-1">{n+1}</td>
              <td className="border border-black px-1 capitalize">{stud.applicationForm?.lastName}, {stud.applicationForm?.firstName} {stud.applicationForm?.middleName ? stud.applicationForm?.middleName[0] + "." : ""}</td>
              <td className="border border-black px-1 capitalize">{stud.applicationForm?.presentAddress || stud.applicationForm?.permanentAddress}</td>
            </tr>
          ))}
          {Array.isArray(listData.grantees) && [{_id: "new-grantees", category: "New Grantees" }, ...listData.grantees]?.map((stud: StudentModel|{_id: string, category: string}, n: number) => (
            <tr key={stud._id}>
              {!!(stud as any).category ? (
                <th className="text-left border border-black px-1" colSpan={3}>{(stud as any).category}</th>
              ) : (
              <>
                <td className="text-right min-w-[15px] border border-black px-1">{n}</td>
                <td className="border border-black px-1 capitalize">{(stud as StudentModel).applicationForm?.lastName}, {(stud as any).applicationForm?.firstName} {(stud as StudentModel).applicationForm?.middleName ? (stud as any).applicationForm.middleName[0] + "." : ""}</td>
                <td className="border border-black px-1 capitalize">{(stud as any).applicationForm?.presentAddress || (stud as any).applicationForm?.permanentAddress}</td>
              </>
              )}
            </tr>
          ))}
          {Array.isArray(listData.oldGrantees) && [{_id: "old-grantees", category: "Old Grantees" }, ...listData.oldGrantees]?.map((stud: StudentModel|{_id: string, category: string}, n: number) => (
            <tr key={stud._id}>
              {!!(stud as any).category ? (
                <th className="text-left border border-black px-1" colSpan={3}>{(stud as any).category}</th>
              ) : (
              <>
                <td className="text-right min-w-[15px] border border-black px-1">{n}</td>
                <td className="border border-black px-1 capitalize">{(stud as StudentModel).applicationForm?.lastName}, {(stud as any).applicationForm?.firstName} {(stud as StudentModel).applicationForm?.middleName ? (stud as any).applicationForm.middleName[0] + "." : ""}</td>
                <td className="border border-black px-1 capitalize">{(stud as any).applicationForm?.presentAddress || (stud as any).applicationForm?.permanentAddress}</td>
              </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )
  }
}
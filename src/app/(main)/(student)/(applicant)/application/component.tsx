'use client';;
import Print from "@app/app/print/component";
import Buttons from "@app/components/buttons";
import { LoadingFull, LoadingSpinnerFull } from "@app/components/loadings";
import Toaster from "@app/components/toaster";
import { useSession } from "@app/lib/useSession";
import { ApplicationFormProps, ApplicationStatus, CivilStatus, Courses, CoursesModel, Gender, NameOfSchoolAttended, ScheduleModel, SchoolSector, StudentModel, YearLevel } from "@app/types";
import { PrinterIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScholarshipApplicationAction } from "./action";



export function InputList({
  label,
  name,
  list = [],
  value,
  className,
  placeholder,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string,
  name: string,
  list: { value: any, label: string }[],
  value?: string,
  className?: string,
  placeholder?: string,
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);

  const filtered  = useMemo(() => list.filter((data) =>
    data.label.toLowerCase().includes(value?.toLowerCase() || "")
  ), [value]);

  const handleSelect = useCallback((label: string) => {
    onChange && onChange(label);
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className={clsx("relative", className)}>
      <label htmlFor={name} className="font-[500]">{label}</label>
      <input
        id={name}
        type="text"
        value={value}
        onChange={(e) => {
          onChange && onChange(e.target.value);
          setIsOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 200);
        }}
        onFocus={() => setIsOpen(true)}
        className="block border border-black px-2 py-1 rounded flex-grow w-full"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoSave="off"
        autoComplete="off"
        aria-autocomplete="none"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-black">
          {filtered.length > 0 ? (
            filtered.map((data) => (
              <div
                key={data.value}
                onClick={() => handleSelect(data.label)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              >
                {data.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">Nothing found</div>
          )}
        </div>
      )}
    </div>
  );
}


export default function ApplicationComponent() {
  const { data: sessionData, status } = useSession({ redirect: false });
  const [courseList, setCourseList] = useState<CoursesModel[]>([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ScheduleModel|true>()
  const fetchData = () => {
    setLoading(true)
    const url = new URL('/api/schedule/selected', window.location.origin)
    url.searchParams.set('sy', (new Date()).getFullYear().toString())
    fetch(url)
      .then(response => response.json())
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch((e) => { console.log(e); setLoading(false); })
  }

  const fetchCourses = () => {
    fetch('/api/courses')
     .then(response => response.json())
     .then(({ data }) => { setCourseList(data); setLoading(false); })
     .catch(error => { console.log(error); setLoading(false); });
  }

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, [])

  const scheduleId = useMemo(() => data !== true ? data?._id || '' : '', [data])

  const [formData, setFormData] = useState<ApplicationFormProps & { studentId?: string }>({
    scheduleId,
    applicationStatus: ApplicationStatus.Submitted,
    rejectReason: '',
    lastName: '',
    firstName: '',
    middleName: '',
    maidenName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    permanentAddress: '',
    zipCode: '',
    province: '',
    presentAddress: '',
    sex: Gender.Male,
    civilStatus: CivilStatus.Single,
    citizenship: '',
    mobileNo: '',
    nameOfSchoolAttended: '',
    schoolAddress: '',
    schoolSector: SchoolSector.Public,
    yearLevel: YearLevel.FirstYear,
    course: '',
    fatherLiving: true,
    fatherName: '',
    fatherAddress: '',
    fatherOccupation: '',
    motherLiving: true,
    motherName: '',
    motherAddress: '',
    motherOccupation: '',
    totalParentGrossIncome: 0,
    siblings: 0,
    otherEducationalFinancialAssistance: false,
  })

  const actionForm = useMemo(() => ScholarshipApplicationAction.bind(null, scheduleId), [scheduleId])

  const handleFormAction = useCallback(async (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    const { error, success } = await actionForm(JSON.stringify(formData))
    if (success) {
      Toaster.success(success)
      setTimeout(() => window.location.reload(), 1000)
    } else if (error) {
      Toaster.error(error)
    }
  }, [formData, actionForm])

  const [applicationData, setApplicationData] = useState<StudentModel & ApplicationFormProps & { studId: string }|undefined>()
  const fetchApplicationData = useCallback(() => {
    if (status === 'authenticated' && !!sessionData?.user) {
      const url = new URL('/api/scholarship/applications/profile/' + (sessionData?.user?._id), window.location.origin);
      url.searchParams.append('populate', 'schedule')
      fetch(url)
        .then(res => res.json())
        .then(({ data }) => setApplicationData(data))
        .catch((e) => console.log(e))
    }
  }, [sessionData, status])
  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData])


  const onPrint = useCallback(() => {
    const url = new URL('/print', window.location.origin)
    url.searchParams.append('template', 'application')
    url.searchParams.append('studentId', applicationData?.studId || '')
    url.searchParams.append('academicYear', (applicationData?.scheduleId as ScheduleModel)?.academicYear.toString())
    // open new window no toolbars for printing only
    window.open(url, '_blank', 'noopener,noreferrer,menubar=no,status=no,titlebar=no,scrollbars=yes,resizable=yes')
  }, [applicationData])

  useEffect(() => {
    if (!(formData.citizenship === CivilStatus.Married && formData.sex === Gender.Female)) {
      setFormData((prev) => ({...prev, maidenName: '' }));
    }
  }, [formData.citizenship, formData.sex])

  return loading ? <LoadingFull /> : (
    <div className="min-h-[600px] flex flex-col items-center justify-center">
      {!data && (
        <div className="text-xl italic text-gray-500 text-center w-full mt-4">
          <p className="text-center w-full">No Schedule for Scholarship. Come back next time for updates.</p>
        </div>
      )}
      {data === true && (
        <div className="text-xl italic text-gray-500 text-center w-full mt-4">
          {!applicationData ? <LoadingSpinnerFull /> : (
            <div className="relative font-normal block">
              <div className="absolute left-4 top-1">
                <Buttons.SignupButton type="button" onClick={onPrint} label={<div className="font-bold"><PrinterIcon className="w-6 h-6 inline" /> Print</div>} />
              </div>
              <div className="mx-auto w-fit shadow border p-8 bg-white text-left block">
                <Print template="application" data={applicationData} viewOnly />
              </div>
            </div>
          )}
        </div>
      )}
      {data !== true && !!data && (<>
        <h1 className="text-2xl font-[600] mt-4">Scholarship Application Form</h1>
        {applicationData?.applicationStatus === ApplicationStatus.Rejected && (
          <div className="p-3 border-red-500 bg-red-100 text-red-500 font-500">
            <p>{applicationData.rejectReason}</p>
          </div>
        )}
        <form onSubmit={handleFormAction} className="mt-4 border px-16 py-8 bg-white rounded-lg shadow mb-4">
          <div className="grid grid-cols-3 gap-x-3 gap-y-2">
            <div>
              <label htmlFor="lastName" className="font-[500]">Last Name:</label>
              <input type="text" id="lastName" name="lastName" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="firstName" className="font-[500]">First Name:</label>
              <input type="text" id="firstName" name="firstName" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="middleName" className="font-[500]">Middle Name:</label>
              <input type="text" id="middleName" name="middleName" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value })} />
            </div>
            <div>
              <label htmlFor="maidenName" className="font-[500]">Maiden Name for Married Women:</label>
              <input type="text" disabled={!(formData.civilStatus === CivilStatus.Married && formData.sex === Gender.Female)} required={formData.civilStatus === CivilStatus.Married && formData.sex === Gender.Female}  id="maidenName" name="maidenName" className="block border border-black px-2 py-1 rounded flex-grow w-full disabled:bg-gray-300" value={formData.maidenName} onChange={(e) => setFormData({...formData, maidenName: e.target.value })} />
            </div>
            <div />
            <div />
            <div>
              <label htmlFor="dateOfBirth" className="font-[500]">Date of Birth:</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.dateOfBirth as string} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="placeOfBirth" className="font-[500]">Place of Birth:</label>
              <input type="text" id="placeOfBirth" name="placeOfBirth" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.placeOfBirth} onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="permanentAddress" className="font-[500]">Permanent Address:</label>
              <input type="text" id="permanentAddress" name="permanentAddress" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.permanentAddress} onChange={(e) => setFormData({...formData, permanentAddress: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="zipCode" className="font-[500]">Zip Code:</label>
              <input type="text" id="zipCode" name="zipCode" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="province" className="font-[500]">Province:</label>
              <input type="text" id="province" name="province" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="presentAddress" className="font-[500]">Present Address:</label>
              <input type="text" id="presentAddress" name="presentAddress" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.presentAddress} onChange={(e) => setFormData({...formData, presentAddress: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="sex" className="font-[500]">Sex:</label>
              <select id="sex" name="sex" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value as Gender })} required>
                <option value={Gender.Male}>Male</option>
                <option value={Gender.Female}>Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="civilStatus" className="font-[500]">Civil Status:</label>
              <select id="civilStatus" name="civilStatus" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.civilStatus} onChange={(e) => setFormData({...formData, civilStatus: e.target.value as CivilStatus })} required>
                <option value={CivilStatus.Single}>Single</option>
                <option value={CivilStatus.Married}>Married</option>
                <option value={CivilStatus.Divorced}>Divorced</option>
                <option value={CivilStatus.Widowed}>Widowed</option>
              </select>
            </div>
            <div>
              <label htmlFor="citizenship" className="font-[500]">Citizenship:</label>
              <input type="text" id="citizenship" name="citizenship" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.citizenship} onChange={(e) => setFormData({...formData, citizenship: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="mobileNo" className="font-[500]">Mobile Number:</label>
              <input type="tel" id="mobileNo" name="mobileNo" className="block border border-black px-2 py-1 rounded flex-grow w-full" minLength={10} maxLength={13} value={formData.mobileNo} onChange={(e) => setFormData({...formData, mobileNo: e.target.value })} required />
            </div>
            <InputList name="nameOfSchoolAttended" placeholder="Enter Name of School Attended" label="Name of School Attended:" list={Object.values(NameOfSchoolAttended).map((v: string) => ({ label: v, value: v }))} value={formData.nameOfSchoolAttended} onChange={(value) => setFormData({...formData, nameOfSchoolAttended: value as any })} required />
            {/* <div>
              <label htmlFor="nameOfSchoolAttended" className="font-[500]">Name of School Attended:</label>
              <select id="nameOfSchoolAttended" name="nameOfSchoolAttended" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.nameOfSchoolAttended} onChange={(e) => setFormData({...formData, nameOfSchoolAttended: e.target.value as NameOfSchoolAttended })} required>
                {Object.values(NameOfSchoolAttended).map((value: string) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div> */}
            <div>
              <label htmlFor="schoolAddress" className="font-[500]">School Address:</label>
              <input type="text" id="schoolAddress" name="schoolAddress" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.schoolAddress} onChange={(e) => setFormData({...formData, schoolAddress: e.target.value })} />
            </div>
            <div>
              <label htmlFor="schoolSector" className="font-[500]">School Sector:</label>
              <select id="schoolSector" name="schoolSector" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.schoolSector} onChange={(e) => setFormData({...formData, schoolSector: e.target.value as SchoolSector })} >
                <option value={SchoolSector.Public}>Public</option>
                <option value={SchoolSector.Private}>Private</option>
              </select>
            </div>
            <div>
              <label htmlFor="yearLevel" className="font-[500]">Year Level:</label>
              <select id="yearLevel" name="yearLevel" value={formData.yearLevel} onChange={(e) => setFormData({...formData, yearLevel: e.target.value !== '' ? parseInt(e.target.value) : 1 })} title="Year Level" className="block border border-black px-2 py-1 rounded flex-grow w-full">
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
            <InputList name="course" placeholder="Enter your course" label="Course:" list={courseList.length === 0 ? Object.values(Courses).map((v: string) => ({ label: v, value: v })) : courseList.map((v: CoursesModel) => ({ label: v.name, value: v.name }))} value={formData.course} onChange={(value) => setFormData({...formData, course: value as any })} required />
            {/* <div> */}
              {/* <label htmlFor="course" className="font-[500]">Course:</label> */}
              {/* <input type="text" id="course" name="course" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value })} required /> */}
            {/* </div> */}
            {formData.yearLevel > 1 && (
              <div>
                <label htmlFor="studentId" className="font-[500]">Student ID: (required)</label>
                <input type="text" id="studentId" name="studentId" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value })} required />
              </div>
            )}
            <div className="col-span-3">
              <label htmlFor="motherLiving" className="font-[500] mr-1">Is your Father Living?</label>
              <input type="radio" id="fatherLivingYes" name="fatherLiving" value="true" className="cursor-pointer"  checked={formData.fatherLiving} onChange={(e) => setFormData({...formData, fatherLiving: !!e.target.checked })} />
              <label htmlFor="fatherLivingYes" className={clsx("mr-2 cursor-pointer", formData.fatherLiving ? 'font-bold' : '')}>Yes, Living</label>
              <input type="radio" id="fatherLivingNo" name="fatherLiving" value="false" className="cursor-pointer" checked={!formData.fatherLiving} onChange={(e) => setFormData({...formData, fatherLiving: !e.target.checked })} />
              <label htmlFor="fatherLivingNo" className={clsx("cursor-pointer", !formData.fatherLiving ? 'font-bold' : '')}>No, Deceased</label>
            </div>
            <div>
              <label htmlFor="fatherName" className="font-[500]">{"Father's"} Name:</label>
              <input type="text" id="fatherName" name="fatherName" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="fatherAddress" className="font-[500]">Father Address:</label>
              <input type="text" id="fatherAddress" name="fatherAddress" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.fatherAddress} onChange={(e) => setFormData({...formData, fatherAddress: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="fatherOccupation" className="font-[500]">Father Occupation:</label>
              <input type="text" id="fatherOccupation" name="fatherOccupation" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.fatherOccupation} onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value })} required />
            </div>
            <div className="col-span-3">
              <label htmlFor="motherLiving" className="font-[500] mr-1">Is your Mother Living?</label>
              <input type="radio" id="motherLivingYes" name="motherLiving" value="true" className="cursor-pointer"  checked={formData.motherLiving} onChange={(e) => setFormData({...formData, motherLiving: !!e.target.checked })} />
              <label htmlFor="motherLivingYes" className={clsx("mr-2 cursor-pointer", formData.motherLiving ? 'font-bold' : '')}>Yes, Living</label>
              <input type="radio" id="motherLivingNo" name="motherLiving" value="false" className="cursor-pointer" checked={!formData.motherLiving} onChange={(e) => setFormData({...formData, motherLiving: !e.target.checked })} />
              <label htmlFor="motherLivingNo" className={clsx("cursor-pointer", !formData.motherLiving ? 'font-bold' : '')}>No, Deceased</label>
            </div>
            <div>
              <label htmlFor="motherName" className="font-[500]">{"Mother's"} Name:</label>
              <input type="text" id="motherName" name="motherName" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="motherAddress" className="font-[500]">Mother Address:</label>
              <input type="text" id="motherAddress" name="motherAddress" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.motherAddress} onChange={(e) => setFormData({...formData, motherAddress: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="motherOccupation" className="font-[500]">Mother Occupation:</label>
              <input type="text" id="motherOccupation" name="motherOccupation" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.motherOccupation} onChange={(e) => setFormData({...formData, motherOccupation: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="totalParentGrossIncome" className="font-[500]">Total Parent Gross Monthly Income:</label>
              <div className="flex justify-start items-center">
                <span className="font-bold max-w-4 mr-2">&#8369;</span>
                <input type="number" min={0} id="totalParentGrossIncome" name="totalParentGrossIncome" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.totalParentGrossIncome === 0 ? '' : formData.totalParentGrossIncome} onChange={(e) => setFormData({ ...formData, totalParentGrossIncome: e.target.value !== '' ? parseFloat(e.target.value) : 0 })} />
              </div>
            </div>
            <div>
              <label htmlFor="siblings" className="font-[500]">Number of Siblings:</label>
              <input type="number" min={0} max={20} id="siblings" name="siblings" className="block border border-black px-2 py-1 rounded flex-grow w-full" value={formData.siblings  === 0 ? '' : formData.siblings} onChange={(e) => setFormData({ ...formData, siblings: e.target.value !== '' ? parseInt(e.target.value) : 0 })} required />
            </div>
            <div className="col-span-3">
              <label htmlFor="otherEducationalFinancialAssistance" className="font-[500] max-w-32 text-wrap cursor-pointer mr-2">Are you enjoying other educational financial assistance?</label>
              <input type="radio" id="otherEducationalFinancialAssistanceYes" name="otherEducationalFinancialAssistance" value="true" className="cursor-pointer"  checked={formData.otherEducationalFinancialAssistance} onChange={(e) => setFormData({...formData, otherEducationalFinancialAssistance: !!e.target.checked })} />
              <label htmlFor="otherEducationalFinancialAssistanceYes" className={clsx("mr-2 cursor-pointer", formData.otherEducationalFinancialAssistance ? 'font-bold' : '')}>Yes</label>
              <input type="radio" id="otherEducationalFinancialAssistanceNo" name="otherEducationalFinancialAssistance" value="false" className="cursor-pointer" checked={!formData.otherEducationalFinancialAssistance} onChange={(e) => setFormData({...formData, otherEducationalFinancialAssistance: !e.target.checked })} />
              <label htmlFor="otherEducationalFinancialAssistanceNo" className={clsx("cursor-pointer", !formData.otherEducationalFinancialAssistance ? 'font-bold' : '')}>No</label>
            </div>
          </div>
          <div className="max-w-64 mx-auto mt-4">
            <Buttons.SignupButton type="submit" label={"Apply for Scholarship"} />
          </div>
        </form>
      </>)}
    </div>
  )
}
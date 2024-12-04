export enum Roles {
  Applicant = 'applicant',
  Admin = 'admin',
  Grantee = 'grantee',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}
export enum CivilStatus {
  Single = 'Single',
  Married = 'Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
}
export enum Courses {
  AB = 'Bachelor of Arts Major in English Language',
  BSBAFM = 'Bachelor of Science in Business Administration Major in Financial Management',
  BSBAHRM = 'Bachelor of Science in Business Administration Major in Human Resource Management',
  BSBAMM = 'Bachelor of Science in Business Administration Major in Marketing Management',
  BSBMHM = 'Bachelor of Science in Business Management Major in Human Resources',
  BSMA = 'Bachelor of Science in Management Accounting',
  BPA = 'Bachelor of Public Administration',
  BSE = 'Bachelor of Science in Entrepreneurship',
  BSIT = 'Bachelor of Science in Information Technology',
  BSCS = 'Bachelor of Science in Computer Science',
  BLIS = 'Bachelor of Library and Information Science',
  BSIS = 'Bachelor of Science in Information System',
  BSCrim = 'Bachelor of Science in Criminology',
  BEed = 'Bachelor of Elementary Education',
  BSedEng = 'Bachelor of Secondary Education Major in English',
  BSedSci = 'Bachelor of Secondary Education Major in Science',
  BSedSoc = 'Bachelor of Secondary Education Major in Social Studies',
  BPed = 'Bachelor of Physical Education',
  BTVTE = 'Bachelor of Technical Vocational Teacher Education',
  BECEd = 'Bachelor of Early Childhood Education',
  BSHM = 'Bachelor of Science in Hospitality Management',
  BSTM = 'Bachelor of Science in Tourism Management',
  BSArch = 'Bachelor of Science in Architecture',
  BSMT = 'Bachelor of Science in Marine Transportation',
  BSSocial = 'Bachelor of Science in Social Works',
  BSAgri = 'Bachelor of Science in Agriculture',
  BSMath = 'Bachelor of Science in Mathematics',
  BSCE = 'Bachelor of Science in Civil Engineering',
  BSN = 'Bachelor of Science in Nursing',
  BSChem = 'Bachelor of Science in Chemistry',
  BSBio = 'Bachelor of Science in Biology',
  BSMedTech = 'Bachelor of Science in Medical Technology',
}

export enum NameOfSchoolAttended {
  SMCC = 'Saint Michael College of Caraga, Inc.',
  NAC = 'Northwestern Agusan Colleges',
  FSUU = 'Father Saturnino Urios University',
  CSUMain = 'Caraga State University - Main Campus',
  CSUCC = 'Caraga State University - Cabadbaran Campus',
  USTP = 'University of Science and Technology of Southern Philippines - CDO Campus',
  CMU = 'Central Mindanao University',
  MSUMarawi = 'Mindanao State University - Marawi City',
  MSUIIT = 'Mindanao State University - Iligan Institute of Technology',
  SJIT = 'Saint Joseph Institute of Technology',
  PECIT = 'Philippine Electronics and Communication Institute of Technology',
  BCC = 'Butuan City Colleges, Inc.',
  HCCB = 'Holy Child Colleges of Butuan',
  MMACI = 'Merchant Marine Academy of Caraga, Inc.',
  AMA = 'ACLC College of Butuan',
  BDC = 'Butuan Doctors College',
  PNU = 'Philippine Normal University - Mindanao',
}
export enum Semester {
  FirstSemester = 1,
  SecondSemester = 2,
}

export enum YearLevel {
  FirstYear = 1,
  SecondYear = 2,
  ThirdYear = 3,
  FourthYear = 4
}

export enum SchoolSector {
  Public = 'Public',
  Private = 'Private',
  None = '',
}

export enum SubmissionStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Disapproved = 'Disapproved',
}

export enum GradeRemarks {
  Passed = 'Passed',
  Failed = 'Failed',
}

export enum MimeTypes {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  PDF = 'application/pdf',
}
export interface BaseDocument {
  _id?: string;
  createdAt?: string|Date
  updatedAt?: string|Date
}
export interface AdminModel extends BaseDocument {
  employeeId: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  photo?: string|FileDocumentModel|null
}

export interface FileDocumentModel extends BaseDocument {
  file: string|Buffer,
  mimeType: MimeTypes
}

export interface SubmissionProps extends BaseDocument {
  photo?: string|FileDocumentModel
  status: SubmissionStatus
}

export interface GranteeModel extends BaseDocument {
  studentId: string|StudentModel
  academicYear: number
  semester: Semester
  grade?: number
  COG: SubmissionProps,
  studyLoad: SubmissionProps,
  statementOfAccount: SubmissionProps,
  CONS: SubmissionProps,
}

export interface RequirementProps {
  name: string
  description?: string
}

export interface RequirementModel extends BaseDocument {
  scheduleId: string|ScheduleModel
  name: string,
  description?: string,
  forFirstYearOnly: boolean,
}

export interface RequirementSubmissionModel extends SubmissionProps {
  requirementId: string|RequirementModel
  submittedBy: string|StudentModel
}

export enum ApplicationStatus {
  Submitted = "submitted",
  Rejected = "rejected"
}

export interface CoursesModel extends BaseDocument {
  name: string,
  createdBy: string|AdminModel
}

export interface ApplicationFormProps extends BaseDocument {
  scheduleId: string|ScheduleModel,
  applicationStatus: ApplicationStatus,
  rejectReason: string,
  lastName: string
  firstName: string
  middleName?: string
  maidenName?: string
  dateOfBirth: string|Date
  placeOfBirth: string
  permanentAddress: string
  zipCode: string
  province: string
  presentAddress: string
  sex: Gender
  civilStatus: CivilStatus
  citizenship: string
  mobileNo: string
  nameOfSchoolAttended: string
  schoolAddress: string
  schoolSector: SchoolSector
  yearLevel: YearLevel
  course: string
  tribalMembership?: string
  typeOfDisability?: string
  fatherLiving: boolean
  fatherName: string
  fatherAddress: string
  fatherOccupation: string
  motherLiving: boolean
  motherName: string
  motherAddress: string
  motherOccupation: string
  totalParentGrossIncome: number
  siblings: number
  otherEducationalFinancialAssistance: boolean
}

export interface StudentModel extends BaseDocument {
  email: string
  password: string
  emailVerified?: Date
  applicationForm?: ApplicationFormProps
  applicationSubmission: string[]|RequirementSubmissionModel[]
  isGrantee: boolean
  photo?: string|FileDocumentModel|null
  studentId?: string
}

export interface AttendanceProps {
  studentId: string|StudentModel
}

export interface ExamProps {
  studentId: string|StudentModel
  percentageScore: number
}

export interface ScheduleModel extends BaseDocument {
  academicYear: number
  range: {
    startDate: string|Date
    endDate: string|Date
  }
  orientationDate?: string|Date
  examDate?: string|Date
  interviewDate?: string|Date
  orientationAttendance: AttendanceProps[]
  examScores: ExamProps[],
  isProfileOpen: boolean,
  scholarshipSlots: number,
}

export enum SecretQuestions1 {
  // Secret Q1: Personal and Family-Related Questions
  FirstSchool = "What is the name of your first school?",
  CityGrewUpIn = "What city did you grow up in?",
  FavoriteTeacher = "What is the name of your favorite teacher?",
  MothersMaidenName = "What is your mother's maiden name?",
  FirstBestFriend = "What was the name of your first best friend?",
  BirthCity = "In what city were you born?",
  FirstEmployer = "What was the name of your first employer?",
  StreetYouGrewUpOn = "What is the name of the street you grew up on?",
  GrandparentsTown = "What is the name of the town or city where your grandparents lived?",
  ChildhoodHero = "Who was your childhood hero?",
}
export enum SecretQuestions2 {
  // Secret Q2: Childhood, Interests, and Experiences
  FirstCarMakeModel = "What was the make and model of your first car?",
  ChildhoodPetName = "What is the name of your childhood pet?",
  FavoriteChildhoodMemory = "What is your favorite childhood memory?",
  FavoriteBook = "What is your favorite book?",
  FirstConcert = "What was your first concert or live event?",
  FavoriteSportsTeam = "What is the name of your favorite sports team?",
  FavoriteSubjectInHighSchool = "What was your favorite subject in high school?",
  FirstMobilePhone = "What was the name of your first mobile phone?",
  FavoriteMovieTitle = "What is the title of your favorite movie?",
  FirstTeacher = "What was the name of your first teacher?",
}

export interface AccountRecoveryModel extends BaseDocument {
  userId?: string
  secretQ: SecretQuestions1
  secretA: string
  secretQ2: SecretQuestions2
  secretA2: string
}

export type AuthenticationStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error'

export interface ActionResponseInterface {
  success?: string
  error?: string
}

export type ActionResponse = ActionResponseInterface | undefined
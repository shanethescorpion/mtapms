import { Metadata } from "next";
import ManageCourses from "./component";

export const metadata: Metadata = {
  title: "Manage Courses"
}

export default function CoursesPage() {
  return <ManageCourses />
}
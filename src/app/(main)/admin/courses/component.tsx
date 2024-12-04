'use client'

import { SignupSelect } from "@app/components/inputs"
import { CoursesModel } from "@app/types"
import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2"
import { createCourse, deleteCourse, updateCourse } from "./action"

export default function ManageCourses() {
  const [courses, setCourses] = useState<CoursesModel[]>([])
  const fetchCourses = () => {
    fetch('/api/courses')
      .then((response) => response.json())
      .then(({ data }) => setCourses(data))
      .catch(console.log)
  }
  useEffect(() => {
    fetchCourses()
  }, [])

  const handleAddCourse = useCallback(() => {
    Swal.fire({
      title: "Add a course",
      input: "text",
      inputPlaceholder: "Course Name",
      confirmButtonText: "Add Course",
      showLoaderOnConfirm: true,
      preConfirm(inputValue) {
        if (!inputValue) {
          return Swal.showValidationMessage("Please enter a course name")
        }
        return new Promise(async (resolve, reject) => {
          const formData = new FormData()
          formData.append("name", inputValue)
          const {success, error } = await createCourse(formData)
          if (success) {
            resolve(inputValue)
          } else {
            reject(error)
          }
        }).then((result) => result)
        .catch((error) => {
          Swal.showValidationMessage(`Error adding course: ${error}`)
        })
      }
    })
    .then(({ isConfirmed, value }: any) => {
      if (isConfirmed) {
        Swal.fire({
          title: "Course `" + value + "` Added Successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        })
        fetchCourses()
      }
    })
  }, [])

  const handleDeleteCourse = useCallback((course: CoursesModel) => {
    Swal.fire({
      title: "Are you sure you want to delete this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { success, error } = await deleteCourse(course._id!)
        if (success) {
          Swal.fire({
            title: "Course `" + course.name + "` Deleted Successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          })
          fetchCourses()
        } else {
          Swal.fire({
            title: "Error deleting course: " + error,
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          })
        }
      }
    })
  }, [])

  const handleEditCourse = useCallback((course: CoursesModel) => {
    Swal.fire({
      title: "Edit Course",
      input: "text",
      inputValue: course.name,
      confirmButtonText: "Update Course",
      showLoaderOnConfirm: true,
      preConfirm(inputValue) {
        if (!inputValue) {
          return Swal.showValidationMessage("Please enter a course name")
        }
        return new Promise(async (resolve, reject) => {
          const formData = new FormData()
          formData.append("name", inputValue)
          const { success, error } = await updateCourse(course._id!, formData)
          if (success) {
            resolve(inputValue)
          } else {
            reject(error)
          }
        }).then((result) => result)
       .catch((error) => {
          Swal.showValidationMessage(`Error updating course: ${error}`)
        })
      }
    })
   .then(({ isConfirmed, value }: any) => {
     if (isConfirmed) {
        Swal.fire({
          title: "Course `" + value + "` Updated Successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        })
        fetchCourses()
      }
    })
  }, [])

  return (
    <div className="p-4">
      <div className="mb-4">
        <button type="button" className="px-4 py-2 shadow bg-green-700 rounded-lg text-white font-bold" onClick={() => handleAddCourse()}>Add a Course</button>
      </div>
      <div className="px-4">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="p-2 border border-black">Courses</th>
              <th className="p-2 border border-black w-auto lg:w-[400px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 py-4 border border-black">No courses found.</td>
              </tr>
            )}
            {courses.length > 0 && courses.map((course, index) => (
              <tr key={index}>
                <td className="p-2 border border-black">{course.name}</td>
                <td className="p-2 border border-black w-[300px]">
                  <div className="flex justify-center gap-x-4 items-center">
                    <button type="button" className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => handleDeleteCourse(course)}>Delete</button>
                    <button type="button" className="px-2 py-1 rounded bg-yellow-600 text-white" onClick={() => handleEditCourse(course)}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
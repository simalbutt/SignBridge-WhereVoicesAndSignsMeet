import API from "./axios";

export const getStudentClasses = () => {
  return API.get("/classrooms/student/classes/");
};

export const enrollInClass = (data) => {
  return API.post("/classrooms/student/enroll/", data);
};

export const unenrollFromClass = (classroomId) => {
  return API.delete(`/classrooms/student/unenroll/${classroomId}/`);
};

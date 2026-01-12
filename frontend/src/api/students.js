import API from "./axios";

export const getClassroomStudents = (classroomId) => {
  return API.get(`/classrooms/${classroomId}/students/`);
};
export const addStudentToClassroom = (classroomId, email) => {
  return API.post(`/classrooms/${classroomId}/students/add/`, {
    email,
  });
};

export const removeStudentFromClassroom = (classroomId, studentId) => {
  return API.delete(
    `/classrooms/${classroomId}/students/${studentId}/remove/`
  );
};

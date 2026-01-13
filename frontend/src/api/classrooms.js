import API from "./axios";

const getClasses = () => API.get("/classrooms/classes/");
const getClassroom = (id) => API.get(`/classrooms/${id}/`);
const createClass = (data) => API.post("/classrooms/classes/", data);
const deleteClass = (id) => API.delete(`/classrooms/classes/${id}/`);
export default { getClasses, createClass, deleteClass,getClassroom };

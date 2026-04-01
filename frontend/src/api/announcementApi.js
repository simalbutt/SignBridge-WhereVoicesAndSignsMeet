import API from "./axios";

export const getClassroomAnnouncements = async (classroomId) => {
  const response = await API.get(`/classrooms/${classroomId}/announcements/`);
  return response.data;
};

export const getAnnouncementDetail = async (announcementId) => {
  const response = await API.get(`/announcements/${announcementId}/`);
  return response.data;
};

export const createAnnouncement = async (classroomId, formData) => {
  const response = await API.post(
    `/classrooms/${classroomId}/announcements/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const updateAnnouncement = async (announcementId, formData) => {
  const response = await API.patch(
    `/announcements/${announcementId}/`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const deleteAnnouncement = async (announcementId) => {
  const response = await API.delete(`/announcements/${announcementId}/`);
  return response.data;
};
import API from "./axios";
export const getAnnouncementComments = async (announcementId) => {
  const response = await API.get(`/classrooms/comments/${announcementId}/`);
  return response.data;
};

export const createComment = async (announcementId, data) => {
  const response = await API.post(`/classrooms/comments/create/${announcementId}/`, data);
  return response.data;
};

export const updateComment = async (commentId, data) => {
  const response = await API.put(`/classrooms/comments/update/${commentId}/`, data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await API.delete(`/classrooms/comments/delete/${commentId}/`);
  return response.data;
};

export const addCommentReply = async (commentId, data) => {
  const response = await API.post(`/classrooms/comments/reply/${commentId}/`, data);
  return response.data;
};

export const editCommentReply = async (commentId, data) => {
  const response = await API.put(`/classrooms/comments/reply/update/${commentId}/`, data);
  return response.data;
};

export const deleteCommentReply = async (commentId) => {
  const response = await API.delete(`/classrooms/comments/reply/delete/${commentId}/`);
  return response.data;
};
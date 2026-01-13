import API from "./axios";

export const getAnnouncementComments = async (announcementId) => {
  const response = await API.get(`/announcements/${announcementId}/comments/`);
  return response.data;
};

export const postCommentReply = async (commentId, data) => {
  const response = await API.patch(`/comments/${commentId}/`, data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await API.delete(`/comments/${commentId}/`);
  return response.data;
};

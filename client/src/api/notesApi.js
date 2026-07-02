import apiClient from './apiClient';

export const getNotes = () => apiClient.get('/notes');
export const getNoteById = (id) => apiClient.get(`/notes/${id}`);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);

export const uploadNote = (file, title, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);

  return apiClient.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

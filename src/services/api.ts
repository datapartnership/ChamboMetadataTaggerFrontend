import {
  ApiResponse,
  FileMetadataDto,
  BlobFileDto,
  User,
  TaggingProgressDto,
  AssignFileRequest,
  AssignBlobFileRequest,
  AssignMultipleFilesRequest,
  AssignMultipleFilesResult,
  CreateUserRequest,
  AddTagsRequest,
  SyncBlobFilesResponse,
  FilePreviewDto,
  StudentWithStatsDto,
  SupervisorReviewDto,
  MarkFileCheckedRequest,
  StudentSupervisorDto,
  AssignStudentToSupervisorRequest,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    // Clear any stored auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return response.json();
};

export const adminApi = {
  async getUsers(token: string): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_URL}/api/Admin/users`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getTaggers(token: string): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_URL}/api/Admin/taggers`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async createUser(token: string, data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_URL}/api/Admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteUser(token: string, userId: number): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getBlobs(token: string): Promise<ApiResponse<BlobFileDto[]>> {
    const response = await fetch(`${API_URL}/api/Admin/blobs`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFiles(token: string): Promise<ApiResponse<FileMetadataDto[]>> {
    const response = await fetch(`${API_URL}/api/Admin/files`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getUnassignedFiles(token: string): Promise<ApiResponse<FileMetadataDto[]>> {
    const response = await fetch(`${API_URL}/api/Admin/files/unassigned`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFile(token: string, fileId: number): Promise<ApiResponse<FileMetadataDto>> {
    const response = await fetch(`${API_URL}/api/Admin/files/${fileId}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async assignFile(token: string, data: AssignFileRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Admin/assign-file`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async assignBlobFile(token: string, data: AssignBlobFileRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Admin/assign-blob-file`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async assignMultipleFiles(token: string, data: AssignMultipleFilesRequest): Promise<ApiResponse<AssignMultipleFilesResult>> {
    const response = await fetch(`${API_URL}/api/Admin/assign-multiple-files`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async syncBlobs(token: string): Promise<ApiResponse<SyncBlobFilesResponse>> {
    const response = await fetch(`${API_URL}/api/Admin/sync-blobs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFilePreview(token: string, fileId: number, expiryMinutes: number = 60): Promise<ApiResponse<FilePreviewDto>> {
    const response = await fetch(`${API_URL}/api/Admin/files/${fileId}/preview?expiryMinutes=${expiryMinutes}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getBlobPreview(token: string, blobName: string, expiryMinutes: number = 60): Promise<ApiResponse<FilePreviewDto>> {
    const response = await fetch(`${API_URL}/api/Admin/blobs/${encodeURIComponent(blobName)}/preview?expiryMinutes=${expiryMinutes}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getTaggingProgress(token: string): Promise<ApiResponse<TaggingProgressDto[]>> {
    const response = await fetch(`${API_URL}/api/Admin/tagging-progress`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getSupervisorAssignments(token: string): Promise<ApiResponse<StudentSupervisorDto[]>> {
    const response = await fetch(`${API_URL}/api/Admin/supervisor-assignments`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async assignStudentToSupervisor(token: string, data: AssignStudentToSupervisorRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Admin/assign-student-to-supervisor`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async unassignStudentFromSupervisor(token: string, data: AssignStudentToSupervisorRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Admin/unassign-student-from-supervisor`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const taggerApi = {
  async getMyFiles(token: string): Promise<ApiResponse<FileMetadataDto[]>> {
    const response = await fetch(`${API_URL}/api/Tagger/my-files`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFile(token: string, fileId: number): Promise<ApiResponse<FileMetadataDto>> {
    const response = await fetch(`${API_URL}/api/Tagger/files/${fileId}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async addTags(token: string, fileId: number, data: AddTagsRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Tagger/files/${fileId}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async completeFile(token: string, fileId: number): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Tagger/files/${fileId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFilePreview(token: string, fileId: number, expiryMinutes: number = 60): Promise<ApiResponse<FilePreviewDto>> {
    const response = await fetch(`${API_URL}/api/Tagger/files/${fileId}/preview?expiryMinutes=${expiryMinutes}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },
};

export const supervisorApi = {
  async getMyStudents(token: string): Promise<ApiResponse<StudentWithStatsDto[]>> {
    const response = await fetch(`${API_URL}/api/Supervisor/my-students`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getStudentFiles(token: string, studentId: number): Promise<ApiResponse<SupervisorReviewDto[]>> {
    const response = await fetch(`${API_URL}/api/Supervisor/students/${studentId}/files`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getAllStudentFiles(token: string): Promise<ApiResponse<SupervisorReviewDto[]>> {
    const response = await fetch(`${API_URL}/api/Supervisor/all-student-files`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFilePreview(token: string, fileId: number, expiryMinutes: number = 60): Promise<ApiResponse<FilePreviewDto>> {
    const response = await fetch(`${API_URL}/api/Supervisor/files/${fileId}/preview?expiryMinutes=${expiryMinutes}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async markFileChecked(token: string, data: MarkFileCheckedRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Supervisor/mark-file-checked`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

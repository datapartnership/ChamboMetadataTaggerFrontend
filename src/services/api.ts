import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
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
  SendBackToTaggerRequest,
  EditFileTagsRequest,
  StudentSupervisorDto,
  AssignStudentToSupervisorRequest,
} from '../types';
import { API_URL } from '../config';

const buildPaginationQuery = (params?: PaginationParams): string => {
  if (!params) return '';
  const p = new URLSearchParams();
  if (params.page !== undefined) p.append('Page', String(params.page));
  if (params.pageSize !== undefined) p.append('PageSize', String(params.pageSize));
  if (params.sortBy !== undefined) p.append('SortBy', params.sortBy);
  if (params.sortOrder !== undefined) p.append('SortOrder', params.sortOrder);
  if (params.isDescending !== undefined) p.append('IsDescending', String(params.isDescending));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
};

const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:logout'));
    throw new Error('Unauthorized');
  }
  return response.json();
};

export const adminApi = {
  async getUsers(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<User>>> {
    const response = await fetch(`${API_URL}/api/Admin/users${buildPaginationQuery(params)}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getTaggers(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<User>>> {
    const response = await fetch(`${API_URL}/api/Admin/taggers${buildPaginationQuery(params)}`, {
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

  async getBlobs(token: string, folder?: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<BlobFileDto>>> {
    const p = new URLSearchParams();
    if (folder) p.append('folder', folder);
    if (params?.page !== undefined) p.append('Page', String(params.page));
    if (params?.pageSize !== undefined) p.append('PageSize', String(params.pageSize));
    if (params?.sortBy !== undefined) p.append('SortBy', params.sortBy);
    if (params?.sortOrder !== undefined) p.append('SortOrder', params.sortOrder);
    if (params?.isDescending !== undefined) p.append('IsDescending', String(params.isDescending));
    const qs = p.toString();
    const response = await fetch(`${API_URL}/api/Admin/blobs${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getFiles(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<FileMetadataDto>>> {
    const response = await fetch(`${API_URL}/api/Admin/files${buildPaginationQuery(params)}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getUnassignedFiles(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<FileMetadataDto>>> {
    const response = await fetch(`${API_URL}/api/Admin/files/unassigned${buildPaginationQuery(params)}`, {
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
    const response = await fetch(`${API_URL}/api/Admin/blobs/preview?blobName=${encodeURIComponent(blobName)}&expiryMinutes=${expiryMinutes}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getTaggingProgress(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<TaggingProgressDto>>> {
    const response = await fetch(`${API_URL}/api/Admin/tagging-progress${buildPaginationQuery(params)}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getSupervisorAssignments(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<StudentSupervisorDto>>> {
    const response = await fetch(`${API_URL}/api/Admin/supervisor-assignments${buildPaginationQuery(params)}`, {
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
  async getMyFiles(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<FileMetadataDto>>> {
    const response = await fetch(`${API_URL}/api/Tagger/my-files${buildPaginationQuery(params)}`, {
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
  async getMyStudents(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<StudentWithStatsDto>>> {
    const response = await fetch(`${API_URL}/api/Supervisor/my-students${buildPaginationQuery(params)}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getStudentFiles(token: string, studentId: number, params?: PaginationParams): Promise<ApiResponse<PagedResponse<SupervisorReviewDto>>> {
    const response = await fetch(`${API_URL}/api/Supervisor/students/${studentId}/files${buildPaginationQuery(params)}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse(response);
  },

  async getAllStudentFiles(token: string, params?: PaginationParams): Promise<ApiResponse<PagedResponse<SupervisorReviewDto>>> {
    const response = await fetch(`${API_URL}/api/Supervisor/all-student-files${buildPaginationQuery(params)}`, {
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

  async sendBackToTagger(token: string, data: SendBackToTaggerRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Supervisor/send-back-to-tagger`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async editFileTags(token: string, fileId: number, data: EditFileTagsRequest): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${API_URL}/api/Supervisor/files/${fileId}/tags`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

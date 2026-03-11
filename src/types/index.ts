export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
  errors: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface TagDto {
  tagKey: string;
  tagValue: string;
}

export interface FileMetadataDto {
  id: number;
  fileName: string;
  fileUrl: string;
  blobName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  status: string;
  taggingCompletedAt: string | null;
  tags: TagDto[];
  assignedToUserIds: number[];
}

export interface BlobFileDto {
  blobName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  lastModified: string | null;
  isDirectory?: boolean;
}

export interface BlobItemDto {
  name: string;
  path: string;
  isDirectory: boolean;
  fileSize?: number;
  contentType?: string;
  lastModified?: string;
}

export interface TaggingProgressDto {
  userId: number;
  username: string;
  totalAssigned: number;
  totalCompleted: number;
  completedFiles: CompletedFileDto[];
}

export interface CompletedFileDto {
  fileId: number;
  fileName: string;
  completedAt: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}

export interface AssignFileRequest {
  fileId: number;
  userId: number;
}

export interface AssignBlobFileRequest {
  blobName: string;
  userId: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AddTagsRequest {
  tags: TagDto[];
}

export interface SyncBlobFilesResponse {
  totalBlobs: number;
  importedFiles: number;
  existingFiles: number;
}

export interface FilePreviewDto {
  fileId: number;
  fileName: string;
  blobName: string;
  previewUrl: string;
  expiresAt: string;
  fileSize: number;
  contentType: string;
}

export interface StudentWithStatsDto {
  studentId: number;
  username: string;
  email: string;
  totalAssigned: number;
  totalCompleted: number;
  inProgress: number;
  recentFiles: FileMetadataDto[];
}

export interface SupervisorReviewDto {
  fileId: number;
  fileName: string;
  status: string;
  studentId: number;
  studentUsername: string;
  tags: TagDto[];
  completedAt: string | null;
  fileUrl: string;
  blobName: string;
  isCheckedBySupervisor: boolean;
  checkedBySupervisorId: number | null;
  checkedAt: string | null;
  supervisorNotes: string | null;
}

export interface MarkFileCheckedRequest {
  fileId: number;
  studentId: number;
  notes: string;
}

export interface StudentSupervisorDto {
  id: number;
  studentId: number;
  studentUsername: string;
  studentEmail: string;
  supervisorId: number;
  supervisorUsername: string;
  assignedAt: string;
  isActive: boolean;
}

export interface AssignStudentToSupervisorRequest {
  studentId: number;
  supervisorId: number;
}

export interface AssignMultipleFilesRequest {
  blobNames: string[];
  userId: number;
}

export interface AssignMultipleFilesResult {
  totalRequested: number;
  successfullyAssigned: number;
  failed: number;
  failedBlobNames: string[];
}

import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, Cloud, Eye, FolderOpen, CheckCircle2, Circle, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { BlobFileDto, User, FileMetadataDto } from '../../types';
import { AssignFileModal } from './AssignFileModal';
import { AssignBlobFileModal } from './AssignBlobFileModal';
import { AssignMultipleFilesModal } from './AssignMultipleFilesModal';
import { FilePreviewModal } from '../FilePreviewModal';
import { BlobPreviewModal } from '../BlobPreviewModal';

type FileDirItem = FileMetadataDto | { isDirectory: true; blobName: string };

const buildFileDirContents = (files: FileMetadataDto[], directory: string): FileDirItem[] => {
  const filtered = files.filter((file) => {
    const relativePath = file.blobName.startsWith(directory)
      ? file.blobName.slice(directory.length)
      : '';
    const isInCurrentDir = !relativePath.includes('/') || relativePath.split('/').length <= 2;
    return file.blobName.startsWith(directory) && isInCurrentDir && relativePath.length > 0;
  });

  const uniqueItems = new Map<string, FileDirItem>();

  filtered.forEach((file) => {
    const relativePath = file.blobName.slice(directory.length);
    const parts = relativePath.split('/').filter((p) => p);
    if (parts.length === 1) {
      uniqueItems.set(file.blobName, file);
    } else {
      const dirName = directory + parts[0] + '/';
      if (!uniqueItems.has(dirName)) {
        uniqueItems.set(dirName, { isDirectory: true, blobName: dirName });
      }
    }
  });

  return Array.from(uniqueItems.values());
};

export const FilesView = () => {
  const { token } = useAuth();
  const [blobFiles, setBlobFiles] = useState<BlobFileDto[]>([]);
  const [allFiles, setAllFiles] = useState<FileMetadataDto[]>([]);
  const [taggers, setTaggers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBlob, setSelectedBlob] = useState<BlobFileDto | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadataDto | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignFileModal, setShowAssignFileModal] = useState(false);
  const [showMultipleFilesModal, setShowMultipleFilesModal] = useState(false);
  const [selectedBlobNames, setSelectedBlobNames] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileMetadataDto | null>(null);
  const [previewBlobName, setPreviewBlobName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned' | 'blobs'>('assigned');
  const [currentDirectory, setCurrentDirectory] = useState<string>('');
  const [directoryContents, setDirectoryContents] = useState<BlobFileDto[]>([]);
  const [assignedDir, setAssignedDir] = useState<string>('');
  const [assignedDirContents, setAssignedDirContents] = useState<FileDirItem[]>([]);
  const [unassignedDir, setUnassignedDir] = useState<string>('');
  const [unassignedDirContents, setUnassignedDirContents] = useState<FileDirItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [blobsRes, filesRes, taggersRes] = await Promise.all([
        adminApi.getBlobs(token),
        adminApi.getFiles(token),
        adminApi.getTaggers(token),
      ]);

      if (blobsRes.success) {
        setBlobFiles(blobsRes.data);
        updateDirectoryView(blobsRes.data, '');
      }
      if (filesRes.success) {
        const files = filesRes.data;
        setAllFiles(files);
        const assigned = files.filter((f) => f.assignedToUserIds.length > 0);
        const unassigned = files.filter((f) => f.assignedToUserIds.length === 0);
        setAssignedDirContents(buildFileDirContents(assigned, ''));
        setUnassignedDirContents(buildFileDirContents(unassigned, ''));
        setAssignedDir('');
        setUnassignedDir('');
      }
      if (taggersRes.success) setTaggers(taggersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDirectoryView = (files: BlobFileDto[], directory: string) => {
    const filtered = files.filter((file) => {
      const relativePath = file.blobName.startsWith(directory) ? file.blobName.slice(directory.length) : '';
      const isInCurrentDir = !relativePath.includes('/') || relativePath.split('/').length <= 2;
      return file.blobName.startsWith(directory) && isInCurrentDir && relativePath.length > 0;
    });

    const uniqueItems = new Map<string, BlobFileDto>();

    filtered.forEach((file) => {
      const relativePath = file.blobName.slice(directory.length);
      const parts = relativePath.split('/').filter((p) => p);

      if (parts.length === 1) {
        // Direct file in this directory
        uniqueItems.set(file.blobName, file);
      } else {
        // Directory entry
        const dirName = directory + parts[0] + '/';
        if (!uniqueItems.has(dirName)) {
          uniqueItems.set(dirName, {
            blobName: dirName,
            fileUrl: '',
            fileSize: 0,
            contentType: '',
            lastModified: null,
            isDirectory: true,
          });
        }
      }
    });

    setDirectoryContents(Array.from(uniqueItems.values()));
    setCurrentDirectory(directory);
  };

  const navigateToDirectory = (dirPath: string) => {
    updateDirectoryView(blobFiles, dirPath);
  };

  const goBack = () => {
    if (currentDirectory === '') return;
    const parts = currentDirectory.slice(0, -1).split('/').filter((p) => p);
    const parent = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '');
    navigateToDirectory(parent);
  };

  const navigateToAssignedDir = (dir: string) => {
    const assigned = allFiles.filter((f) => f.assignedToUserIds.length > 0);
    setAssignedDirContents(buildFileDirContents(assigned, dir));
    setAssignedDir(dir);
  };

  const goBackAssigned = () => {
    if (assignedDir === '') return;
    const parts = assignedDir.slice(0, -1).split('/').filter((p) => p);
    const parent = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '');
    navigateToAssignedDir(parent);
  };

  const navigateToUnassignedDir = (dir: string) => {
    const unassigned = allFiles.filter((f) => f.assignedToUserIds.length === 0);
    setUnassignedDirContents(buildFileDirContents(unassigned, dir));
    setUnassignedDir(dir);
  };

  const goBackUnassigned = () => {
    if (unassignedDir === '') return;
    const parts = unassignedDir.slice(0, -1).split('/').filter((p) => p);
    const parent = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '');
    navigateToUnassignedDir(parent);
  };

  const handleAssignFile = (file: FileMetadataDto) => {
    setSelectedFile(file);
    setShowAssignFileModal(true);
  };

  const handleAssignFileSuccess = () => {
    setShowAssignFileModal(false);
    setSelectedFile(null);
    loadData();
  };

  const handleSync = async () => {
    if (!token) return;

    setSyncing(true);
    try {
      const response = await adminApi.syncBlobs(token);
      if (response.success) {
        alert(`Sync complete! ${response.data.importedFiles} new files imported, ${response.data.existingFiles} already exist.`);
        loadData();
      }
    } catch (error) {
      console.error('Error syncing blobs:', error);
      alert('Failed to sync blob files');
    } finally {
      setSyncing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAssign = (blob: BlobFileDto) => {
    setSelectedBlob(blob);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setShowMultipleFilesModal(false);
    setSelectedBlob(null);
    setSelectedBlobNames(new Set());
    loadData();
  };

  const handleToggleBlobSelection = (blobName: string) => {
    const newSelected = new Set(selectedBlobNames);
    if (newSelected.has(blobName)) {
      newSelected.delete(blobName);
    } else {
      newSelected.add(blobName);
    }
    setSelectedBlobNames(newSelected);
  };

  const handleSelectAllBlobs = () => {
    const selectableBlobs = directoryContents.filter((item) => !item.isDirectory);
    if (selectedBlobNames.size === selectableBlobs.length && selectableBlobs.length > 0) {
      setSelectedBlobNames(new Set());
    } else {
      setSelectedBlobNames(new Set(selectableBlobs.map((b) => b.blobName)));
    }
  };

  const handleAssignMultipleBlobs = () => {
    if (selectedBlobNames.size > 0) {
      setShowMultipleFilesModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading blob files...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">File Management</h2>
              <p className="text-sm text-slate-600 mt-1">Manage assigned files and blob storage</p>
            </div>
            {activeTab === 'blobs' && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Blobs'}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'assigned'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Assigned Files ({allFiles.filter((f) => f.assignedToUserIds.length > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('unassigned')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'unassigned'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Unassigned ({allFiles.filter((f) => f.assignedToUserIds.length === 0).length})
            </button>
            <button
              onClick={() => setActiveTab('blobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'blobs'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Blob Storage ({blobFiles.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'assigned' ? (
            <>
              {assignedDir !== '' && (
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <button
                    onClick={goBackAssigned}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <span className="text-sm text-slate-600">
                    {assignedDir.split('/').filter((p) => p).pop() || 'Root'}
                  </span>
                </div>
              )}
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assignedDirContents.map((item, index) => {
                    const isDir = 'isDirectory' in item && item.isDirectory;
                    const file = isDir ? null : (item as FileMetadataDto);
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isDir ? (
                              <>
                                <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <button
                                  onClick={() => navigateToAssignedDir(item.blobName)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate text-left"
                                >
                                  {item.blobName.split('/').filter((p) => p).pop()}
                                </button>
                              </>
                            ) : (
                              <>
                                <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {file!.fileName}
                                  </p>
                                  <p className="text-xs text-slate-600">{file!.contentType}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {!isDir && formatFileSize(file!.fileSize)}
                        </td>
                        <td className="px-6 py-4">
                          {!isDir && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                              file!.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-accent-teal-100 text-blue-800'
                            }`}>
                              {file!.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!isDir && file!.assignedToUserIds?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {file!.assignedToUserIds.map((uid) => {
                                const user = taggers.find((t) => t.id === uid);
                                return user ? (
                                  <span key={uid} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                    {user.username}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          {!isDir && (
                            <span className="text-sm text-slate-600">
                              {file!.tags?.length || 0} tags
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isDir && (
                            <button
                              onClick={() => setPreviewFile(file!)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Preview
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {assignedDirContents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No assigned files yet</p>
                </div>
              )}
            </>
          ) : activeTab === 'unassigned' ? (
            <>
              {unassignedDir !== '' && (
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <button
                    onClick={goBackUnassigned}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <span className="text-sm text-slate-600">
                    {unassignedDir.split('/').filter((p) => p).pop() || 'Root'}
                  </span>
                </div>
              )}
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unassignedDirContents.map((item, index) => {
                    const isDir = 'isDirectory' in item && item.isDirectory;
                    const file = isDir ? null : (item as FileMetadataDto);
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isDir ? (
                              <>
                                <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <button
                                  onClick={() => navigateToUnassignedDir(item.blobName)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate text-left"
                                >
                                  {item.blobName.split('/').filter((p) => p).pop()}
                                </button>
                              </>
                            ) : (
                              <>
                                <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {file!.fileName}
                                  </p>
                                  <p className="text-xs text-slate-600">{file!.contentType}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {!isDir && formatFileSize(file!.fileSize)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {isDir ? 'Folder' : file!.contentType || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isDir && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPreviewFile(file!)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                              <button
                                onClick={() => handleAssignFile(file!)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {unassignedDirContents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No unassigned files</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Directory Navigation */}
              {currentDirectory !== '' && (
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                  <button
                    onClick={goBack}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <span className="text-sm text-slate-600">
                    {currentDirectory.split('/').filter((p) => p).pop() || 'Root'}
                  </span>
                </div>
              )}

              {/* Bulk Selection Toolbar */}
              {selectedBlobNames.size > 0 && (
                <div className="p-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedBlobNames.size} item{selectedBlobNames.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleAssignMultipleBlobs}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign Selected
                  </button>
                </div>
              )}

              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      <button
                        onClick={handleSelectAllBlobs}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title={selectedBlobNames.size === directoryContents.filter((i) => !i.isDirectory).length ? 'Deselect all' : 'Select all'}
                      >
                        {selectedBlobNames.size === directoryContents.filter((i) => !i.isDirectory).length && directoryContents.filter((i) => !i.isDirectory).length > 0 ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {directoryContents.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-slate-50 transition-colors ${!item.isDirectory && selectedBlobNames.has(item.blobName) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        {!item.isDirectory ? (
                          <button
                            onClick={() => handleToggleBlobSelection(item.blobName)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {selectedBlobNames.has(item.blobName) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        ) : (
                          <div className="w-7" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.isDirectory ? (
                            <>
                              <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
                              <button
                                onClick={() =>
                                  navigateToDirectory(item.blobName)
                                }
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate text-left"
                              >
                                {item.blobName.split('/').filter((p) => p).pop()}
                              </button>
                            </>
                          ) : (
                            <>
                              <Cloud className="w-5 h-5 text-blue-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {item.blobName.split('/').pop()}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {!item.isDirectory && formatFileSize(item.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.isDirectory ? 'Folder' : item.contentType || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {!item.isDirectory && formatDate(item.lastModified)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!item.isDirectory && (
                            <>
                              <button
                                onClick={() => setPreviewBlobName(item.blobName)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                              <button
                                onClick={() => handleAssign(item)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Assign
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {directoryContents.length === 0 && (
                <div className="text-center py-12">
                  {blobFiles.length === 0 ? (
                    <>
                      <Cloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 mb-2">No blob files found</p>
                      <button
                        onClick={handleSync}
                        className="text-sm text-accent-teal-600 hover:text-blue-800"
                      >
                        Click "Sync Blobs" to load files from Azure Blob Storage
                      </button>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">This folder is empty</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAssignFileModal && selectedFile && (
        <AssignFileModal
          file={selectedFile}
          taggers={taggers}
          onClose={() => setShowAssignFileModal(false)}
          onSuccess={handleAssignFileSuccess}
        />
      )}

      {showAssignModal && selectedBlob && (
        <AssignBlobFileModal
          blob={selectedBlob}
          taggers={taggers}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {showMultipleFilesModal && selectedBlobNames.size > 0 && (
        <AssignMultipleFilesModal
          selectedBlobs={directoryContents.filter((b) => selectedBlobNames.has(b.blobName))}
          taggers={taggers}
          onClose={() => setShowMultipleFilesModal(false)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          fileId={previewFile.id}
          fileName={previewFile.fileName}
          getPreview={adminApi.getFilePreview}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {previewBlobName && (
        <BlobPreviewModal
          blobName={previewBlobName}
          getPreview={adminApi.getBlobPreview}
          onClose={() => setPreviewBlobName(null)}
        />
      )}
    </div>
  );
};

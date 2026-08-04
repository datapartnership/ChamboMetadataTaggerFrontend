import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, Cloud, Eye, FolderOpen, CheckCircle2, Circle, UserPlus, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { BlobFileDto, User, FileMetadataDto } from '../../types';
import { AssignFileModal } from './AssignFileModal';
import { AssignBlobFileModal } from './AssignBlobFileModal';
import { AssignMultipleFilesModal } from './AssignMultipleFilesModal';
import { FilePreviewModal } from '../FilePreviewModal';
import { BlobPreviewModal } from '../BlobPreviewModal';
import { Pagination } from '../Pagination';


export const FilesView = () => {
  const { token } = useAuth();
  // Blobs tab state
  const [blobItems, setBlobItems] = useState<BlobFileDto[]>([]);
  const [blobPage, setBlobPage] = useState(1);
  const [blobPageSize, setBlobPageSize] = useState(25);
  const [blobTotalCount, setBlobTotalCount] = useState(0);
  const [blobTotalPages, setBlobTotalPages] = useState(0);
  const [blobHasNext, setBlobHasNext] = useState(false);
  const [blobHasPrev, setBlobHasPrev] = useState(false);
  // Assigned files tab state
  const [assignedFiles, setAssignedFiles] = useState<FileMetadataDto[]>([]);
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedPageSize, setAssignedPageSize] = useState(25);
  const [assignedTotalCount, setAssignedTotalCount] = useState(0);
  const [assignedTotalPages, setAssignedTotalPages] = useState(0);
  const [assignedHasNext, setAssignedHasNext] = useState(false);
  const [assignedHasPrev, setAssignedHasPrev] = useState(false);
  type FilesSortField = 'uploadedAt' | 'fileName';
  const [assignedSortBy, setAssignedSortBy] = useState<FilesSortField>('uploadedAt');
  const [assignedIsDescending, setAssignedIsDescending] = useState(true);
  // Unassigned files tab state
  const [unassignedFiles, setUnassignedFiles] = useState<FileMetadataDto[]>([]);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [unassignedPageSize, setUnassignedPageSize] = useState(25);
  const [unassignedTotalCount, setUnassignedTotalCount] = useState(0);
  const [unassignedTotalPages, setUnassignedTotalPages] = useState(0);
  const [unassignedHasNext, setUnassignedHasNext] = useState(false);
  const [unassignedHasPrev, setUnassignedHasPrev] = useState(false);
  const [unassignedSortBy, setUnassignedSortBy] = useState<FilesSortField>('uploadedAt');
  const [unassignedIsDescending, setUnassignedIsDescending] = useState(true);
  const [taggers, setTaggers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedBlob, setSelectedBlob] = useState<BlobFileDto | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileMetadataDto | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignFileModal, setShowAssignFileModal] = useState(false);
  const [showMultipleFilesModal, setShowMultipleFilesModal] = useState(false);
  const [selectedBlobNames, setSelectedBlobNames] = useState<Set<string>>(new Set());
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(new Set());
  const [showMultipleUnassignedModal, setShowMultipleUnassignedModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileMetadataDto | null>(null);
  const [previewBlobName, setPreviewBlobName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned' | 'blobs'>('assigned');
  const [currentDirectory, setCurrentDirectory] = useState<string>('');
  const [directoryContents, setDirectoryContents] = useState<BlobFileDto[]>([]);
  const [assignedStatusFilter, setAssignedStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (token) loadTaggers();
  }, [token]);

  useEffect(() => {
    if (token) loadBlobs();
  }, [token, blobPage, blobPageSize, currentDirectory]);

  useEffect(() => {
    if (token) loadAssignedFiles();
  }, [token, assignedPage, assignedPageSize, assignedSortBy, assignedIsDescending]);

  useEffect(() => {
    if (token) loadUnassignedFiles();
  }, [token, unassignedPage, unassignedPageSize, unassignedSortBy, unassignedIsDescending]);

  const loadTaggers = async () => {
    if (!token) return;
    try {
      const res = await adminApi.getTaggers(token, { page: 1, pageSize: 200 });
      if (res.success) setTaggers(res.data.items);
    } catch (error) {
      console.error('Error loading taggers:', error);
    }
  };

  const loadBlobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.getBlobs(token, currentDirectory || undefined, {
        page: blobPage,
        pageSize: blobPageSize,
      });
      if (res.success) {
        setBlobItems(res.data.items);
        setBlobTotalCount(res.data.totalCount);
        setBlobTotalPages(res.data.totalPages);
        setBlobHasNext(res.data.hasNextPage);
        setBlobHasPrev(res.data.hasPreviousPage);
        updateDirectoryView(res.data.items, currentDirectory);
      }
    } catch (error) {
      console.error('Error loading blobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedFiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.getFiles(token, { page: assignedPage, pageSize: assignedPageSize, sortBy: assignedSortBy, isDescending: assignedIsDescending });
      if (res.success) {
        setAssignedFiles(res.data.items);
        setAssignedTotalCount(res.data.totalCount);
        setAssignedTotalPages(res.data.totalPages);
        setAssignedHasNext(res.data.hasNextPage);
        setAssignedHasPrev(res.data.hasPreviousPage);
      }
    } catch (error) {
      console.error('Error loading assigned files:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnassignedFiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.getUnassignedFiles(token, { page: unassignedPage, pageSize: unassignedPageSize, sortBy: unassignedSortBy, isDescending: unassignedIsDescending });
      if (res.success) {
        setUnassignedFiles(res.data.items);
        setUnassignedTotalCount(res.data.totalCount);
        setUnassignedTotalPages(res.data.totalPages);
        setUnassignedHasNext(res.data.hasNextPage);
        setUnassignedHasPrev(res.data.hasPreviousPage);
      }
    } catch (error) {
      console.error('Error loading unassigned files:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDirectoryView = (files: BlobFileDto[], directory: string) => {
    const filtered = files.filter((file) => {
      const relativePath = file.blobName.startsWith(directory) ? file.blobName.slice(directory.length) : '';
      return file.blobName.startsWith(directory) && relativePath.length > 0;
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
    setCurrentDirectory(dirPath);
    setBlobPage(1);
    setSelectedBlobNames(new Set());
  };

  const goBack = () => {
    if (currentDirectory === '') return;
    const parts = currentDirectory.slice(0, -1).split('/').filter((p) => p);
    const parent = parts.slice(0, -1).join('/') + (parts.length > 1 ? '/' : '');
    setCurrentDirectory(parent);
    setBlobPage(1);
    setSelectedBlobNames(new Set());
  };

  const handleAssignFile = (file: FileMetadataDto) => {
    setSelectedFile(file);
    setShowAssignFileModal(true);
  };

  const handleAssignedSort = (field: FilesSortField) => {
    if (assignedSortBy === field) {
      setAssignedIsDescending((prev) => !prev);
    } else {
      setAssignedSortBy(field);
      setAssignedIsDescending(false);
    }
    setAssignedPage(1);
  };

  const handleUnassignedSort = (field: FilesSortField) => {
    if (unassignedSortBy === field) {
      setUnassignedIsDescending((prev) => !prev);
    } else {
      setUnassignedSortBy(field);
      setUnassignedIsDescending(false);
    }
    setUnassignedPage(1);
  };

  const SortIcon = ({ field, currentSortBy, currentIsDescending }: { field: string; currentSortBy: string; currentIsDescending: boolean }) => {
    if (currentSortBy !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return currentIsDescending ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  };

  const handleAssignFileSuccess = () => {
    setShowAssignFileModal(false);
    setSelectedFile(null);
    loadAssignedFiles();
    loadUnassignedFiles();
  };

  const handleSync = async () => {
    if (!token) return;

    setSyncing(true);
    try {
      const response = await adminApi.syncBlobs(token);
      if (response.success) {
        alert(`Sync complete! ${response.data.importedFiles} new files imported, ${response.data.existingFiles} already exist.`);
        loadBlobs();
        loadAssignedFiles();
        loadUnassignedFiles();
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

  const handlePreviewFile = async (file: FileMetadataDto) => {
    if (!token) return;
    try {
      const response = await adminApi.getFile(token, file.id);
      setPreviewFile(response.success ? response.data : file);
    } catch {
      setPreviewFile(file);
    }
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
    loadBlobs();
    loadAssignedFiles();
    loadUnassignedFiles();
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

  const handleToggleFileSelection = (fileId: number) => {
    const newSelected = new Set(selectedFileIds);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFileIds(newSelected);
  };

  const handleSelectAllUnassignedFiles = () => {
    if (selectedFileIds.size === unassignedFiles.length && unassignedFiles.length > 0) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(unassignedFiles.map((f) => f.id)));
    }
  };

  const handleAssignMultipleUnassignedSuccess = () => {
    setShowMultipleUnassignedModal(false);
    setSelectedFileIds(new Set());
    loadAssignedFiles();
    loadUnassignedFiles();
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
              Assigned Files ({assignedTotalCount})
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
              Unassigned ({unassignedTotalCount})
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
              Blob Storage ({blobTotalCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'assigned' ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
                  {([
                    { value: 'all', label: 'All' },
                    { value: 'Assigned', label: 'Assigned' },
                    { value: 'SubmittedToSupervisor', label: 'Submitted' },
                    { value: 'SendBackToTagger', label: 'Sent Back' },
                    { value: 'ApprovedBySupervisor', label: 'Approved' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setAssignedStatusFilter(value); setAssignedPage(1); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        assignedStatusFilter === value
                          ? value === 'all'
                            ? 'bg-slate-700 text-white'
                            : value === 'ApprovedBySupervisor'
                            ? 'bg-green-600 text-white'
                            : value === 'SubmittedToSupervisor'
                            ? 'bg-blue-600 text-white'
                            : value === 'SendBackToTagger'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sort:</span>
                  <button
                    onClick={() => handleAssignedSort('uploadedAt')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      assignedSortBy === 'uploadedAt'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Date <SortIcon field="uploadedAt" currentSortBy={assignedSortBy} currentIsDescending={assignedIsDescending} />
                  </button>
                  <button
                    onClick={() => handleAssignedSort('fileName')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      assignedSortBy === 'fileName'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Filename <SortIcon field="fileName" currentSortBy={assignedSortBy} currentIsDescending={assignedIsDescending} />
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assignedFiles
                    .filter((f) => assignedStatusFilter === 'all' || f.status === assignedStatusFilter)
                    .map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.fileName}</p>
                            <p className="text-xs text-slate-600">{file.contentType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatFileSize(file.fileSize)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          file.status === 'ApprovedBySupervisor'
                            ? 'bg-green-100 text-green-800'
                            : file.status === 'SubmittedToSupervisor'
                            ? 'bg-blue-100 text-blue-800'
                            : file.status === 'SendBackToTagger'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {file.status === 'ApprovedBySupervisor' ? 'Approved'
                            : file.status === 'SubmittedToSupervisor' ? 'Submitted'
                            : file.status === 'SendBackToTagger' ? 'Sent Back'
                            : file.status === 'Assigned' ? 'Assigned'
                            : file.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {file.assignedToUserIds?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {file.assignedToUserIds.map((uid) => {
                              const tagger = taggers.find((t) => t.id === uid);
                              return tagger ? (
                                <span key={uid} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                  {tagger.username}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{file.tags?.length || 0} tags</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePreviewFile(file)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {assignedFiles.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No files found</p>
                </div>
              )}
              <Pagination
                page={assignedPage}
                totalPages={assignedTotalPages}
                totalCount={assignedTotalCount}
                pageSize={assignedPageSize}
                hasNextPage={assignedHasNext}
                hasPreviousPage={assignedHasPrev}
                onPageChange={(p) => setAssignedPage(p)}
                onPageSizeChange={(s) => { setAssignedPageSize(s); setAssignedPage(1); }}
              />
            </>
          ) : activeTab === 'unassigned' ? (
            <>
              {/* Sort Controls */}
              <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sort:</span>
                <button
                  onClick={() => handleUnassignedSort('uploadedAt')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    unassignedSortBy === 'uploadedAt'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Date <SortIcon field="uploadedAt" currentSortBy={unassignedSortBy} currentIsDescending={unassignedIsDescending} />
                </button>
                <button
                  onClick={() => handleUnassignedSort('fileName')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    unassignedSortBy === 'fileName'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Filename <SortIcon field="fileName" currentSortBy={unassignedSortBy} currentIsDescending={unassignedIsDescending} />
                </button>
              </div>

              {/* Bulk Selection Toolbar */}
              {selectedFileIds.size > 0 && (
                <div className="p-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFileIds.size} item{selectedFileIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setShowMultipleUnassignedModal(true)}
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
                        onClick={handleSelectAllUnassignedFiles}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title={selectedFileIds.size === unassignedFiles.length ? 'Deselect all' : 'Select all'}
                      >
                        {selectedFileIds.size === unassignedFiles.length && unassignedFiles.length > 0 ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unassignedFiles.map((file) => (
                    <tr key={file.id} className={`hover:bg-slate-50 transition-colors ${selectedFileIds.has(file.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFileSelection(file.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {selectedFileIds.has(file.id) ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.fileName}</p>
                            <p className="text-xs text-slate-600">{file.contentType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatFileSize(file.fileSize)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{file.contentType || 'Unknown'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleAssignFile(file)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {unassignedFiles.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No unassigned files</p>
                </div>
              )}
              <Pagination
                page={unassignedPage}
                totalPages={unassignedTotalPages}
                totalCount={unassignedTotalCount}
                pageSize={unassignedPageSize}
                hasNextPage={unassignedHasNext}
                hasPreviousPage={unassignedHasPrev}
                onPageChange={(p) => { setUnassignedPage(p); setSelectedFileIds(new Set()); }}
                onPageSizeChange={(s) => { setUnassignedPageSize(s); setUnassignedPage(1); setSelectedFileIds(new Set()); }}
              />
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
                  {blobTotalCount === 0 ? (
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
              <Pagination
                page={blobPage}
                totalPages={blobTotalPages}
                totalCount={blobTotalCount}
                pageSize={blobPageSize}
                hasNextPage={blobHasNext}
                hasPreviousPage={blobHasPrev}
                onPageChange={(p) => setBlobPage(p)}
                onPageSizeChange={(s) => { setBlobPageSize(s); setBlobPage(1); }}
              />
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

      {showMultipleUnassignedModal && selectedFileIds.size > 0 && (
        <AssignMultipleFilesModal
          selectedBlobs={unassignedFiles
            .filter((f) => selectedFileIds.has(f.id))
            .map((f) => ({
              blobName: f.blobName,
              fileUrl: f.fileUrl,
              fileSize: f.fileSize,
              contentType: f.contentType,
              lastModified: null,
            }))}
          taggers={taggers}
          onClose={() => setShowMultipleUnassignedModal(false)}
          onSuccess={handleAssignMultipleUnassignedSuccess}
        />
      )}

      {previewFile && (
        <FilePreviewModal
          fileId={previewFile.id}
          fileName={previewFile.fileName}
          getPreview={adminApi.getFilePreview}
          onClose={() => setPreviewFile(null)}
          tags={previewFile.tags}
          status={previewFile.status}
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

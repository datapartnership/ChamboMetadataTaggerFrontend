import { useState, useEffect } from 'react';
import { FileText, Filter, RotateCcw, User, ChevronUp, ChevronDown, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { SupervisorReviewDto, MarkFileCheckedRequest } from '../../types';
import { ReviewFileModal } from './ReviewFileModal';
import { Pagination } from '../Pagination';

export const ReviewView = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState<SupervisorReviewDto[]>([]);
  const [selectedFile, setSelectedFile] = useState<SupervisorReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unchecked' | 'checked' | 'sentback'>('unchecked');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  type SortField = 'completedAt' | 'studentUsername';
  const [sortBy, setSortBy] = useState<SortField>('completedAt');
  const [isDescending, setIsDescending] = useState(true);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [page, pageSize, sortBy, isDescending, token]);

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await supervisorApi.getAllStudentFiles(token, { page, pageSize, sortBy, isDescending });
      if (response.success) {
        setFiles(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => { setPage(newPage); setSelectedFileIds(new Set()); };
  const handlePageSizeChange = (newSize: number) => { setPageSize(newSize); setPage(1); setSelectedFileIds(new Set()); };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setIsDescending((prev) => !prev);
    } else {
      setSortBy(field);
      setIsDescending(false);
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return isDescending ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  };

  const filteredFiles = files.filter((f) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'unchecked') return f.status === 'SubmittedToSupervisor';
    if (filterStatus === 'checked') return f.status === 'ApprovedBySupervisor';
    if (filterStatus === 'sentback') return f.status === 'SendBackToTagger';
    return true;
  });

  const handleFileReviewed = () => {
    setSelectedFile(null);
    loadFiles();
  };

  const handleToggleSelection = (fileId: number) => {
    const next = new Set(selectedFileIds);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFileIds(next);
  };

  const handleSelectAllSubmitted = () => {
    const submittedIds = filteredFiles
      .filter((f) => f.status === 'SubmittedToSupervisor')
      .map((f) => f.fileId);
    const allSelected = submittedIds.length > 0 && submittedIds.every((id) => selectedFileIds.has(id));
    setSelectedFileIds(allSelected ? new Set() : new Set(submittedIds));
  };

  const handleBulkApprove = async () => {
    if (!token || selectedFileIds.size === 0) return;
    setBulkApproving(true);
    const requests: Promise<unknown>[] = files
      .filter((f) => selectedFileIds.has(f.fileId))
      .map((f) => supervisorApi.markFileChecked(token, { fileId: f.fileId, studentId: f.studentId, notes: null } as MarkFileCheckedRequest));
    await Promise.allSettled(requests);
    setSelectedFileIds(new Set());
    setBulkApproving(false);
    loadFiles();
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading files...</div>;
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Files to Review</h3>
        <p className="text-slate-600">Your students haven't submitted any files yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Submitted
            </button>
            <button
              onClick={() => setFilterStatus('unchecked')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'unchecked'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Needs Review
            </button>
            <button
              onClick={() => setFilterStatus('checked')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'checked'
                  ? 'bg-primary-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('sentback')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'sentback'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sent Back
            </button>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          {filteredFiles.length} of {pageSize} on this page
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Sort:</span>
        <button
          onClick={() => handleSort('completedAt')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
            sortBy === 'completedAt'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
          }`}
        >
          Date <SortIcon field="completedAt" />
        </button>
        <button
          onClick={() => handleSort('studentUsername')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
            sortBy === 'studentUsername'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tagger <SortIcon field="studentUsername" />
        </button>
      </div>

      {selectedFileIds.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedFileIds.size} file{selectedFileIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllSubmitted}
              className="px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {filteredFiles.filter((f) => f.status === 'SubmittedToSupervisor').every((f) => selectedFileIds.has(f.fileId))
                ? 'Deselect All'
                : 'Select All Submitted'}
            </button>
            <button
              onClick={() => setSelectedFileIds(new Set())}
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ✕ Clear
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={bulkApproving}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bulkApproving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />}
              {bulkApproving ? 'Approving...' : `Approve ${selectedFileIds.size} File${selectedFileIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No files match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.fileId}
              onClick={() => setSelectedFile(file)}
              className={`rounded-xl p-4 transition-colors cursor-pointer text-left ${
                selectedFileIds.has(file.fileId)
                  ? 'bg-blue-50 ring-2 ring-blue-300'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <div className="flex items-center gap-1.5">
                  {file.status === 'ApprovedBySupervisor' ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">
                      Approved
                    </span>
                  ) : file.status === 'SendBackToTagger' ? (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      Sent Back
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                      Submitted
                    </span>
                  )}
                  {file.status === 'SubmittedToSupervisor' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleSelection(file.fileId); }}
                      className="p-0.5 rounded hover:bg-slate-200 transition-colors"
                      title={selectedFileIds.has(file.fileId) ? 'Deselect' : 'Select for bulk approval'}
                    >
                      {selectedFileIds.has(file.fileId)
                        ? <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        : <Circle className="w-4 h-4 text-slate-400" />}
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-medium text-slate-900 mb-1 truncate">{file.fileName}</h3>
              <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                <User className="w-3 h-3 flex-shrink-0" />
                {file.studentUsername}
              </p>

              <div className="text-xs text-slate-500">
                {file.tags.length} tag{file.tags.length !== 1 ? 's' : ''}
                {file.completedAt && (
                  <> • {new Date(file.completedAt).toLocaleDateString()}</>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <ReviewFileModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onReviewed={handleFileReviewed}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

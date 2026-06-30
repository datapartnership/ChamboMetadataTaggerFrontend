import { useState, useEffect } from 'react';
import { FileText, Filter, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { SupervisorReviewDto } from '../../types';
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

  useEffect(() => {
    loadFiles();
  }, [page, pageSize, token]);

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await supervisorApi.getAllStudentFiles(token, { page, pageSize });
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

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => { setPageSize(newSize); setPage(1); };

  const filteredFiles = files.filter((f) => {
    const isSubmitted = f.status === 'SubmittedToSupervisor' || f.status === 'SendBackToTagger';
    if (filterStatus === 'all') return isSubmitted;
    if (filterStatus === 'unchecked') return f.status === 'SubmittedToSupervisor' && !f.isCheckedBySupervisor;
    if (filterStatus === 'checked') return f.isCheckedBySupervisor;
    if (filterStatus === 'sentback') return f.status === 'SendBackToTagger';
    return isSubmitted;
  });

  const handleFileReviewed = () => {
    setSelectedFile(null);
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
              Reviewed
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

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No files match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <button
              key={file.fileId}
              onClick={() => setSelectedFile(file)}
              className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                {file.status === 'SendBackToTagger' ? (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Sent Back
                  </span>
                ) : file.isCheckedBySupervisor ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md">
                    Reviewed
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                    Pending
                  </span>
                )}
              </div>

              <h3 className="font-medium text-slate-900 mb-1 truncate">{file.fileName}</h3>
              <p className="text-sm text-slate-600 mb-3">by {file.studentUsername}</p>

              <div className="text-xs text-slate-500">
                {file.tags.length} tag{file.tags.length !== 1 ? 's' : ''}
                {file.completedAt && (
                  <> • {new Date(file.completedAt).toLocaleDateString()}</>
                )}
              </div>
            </button>
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

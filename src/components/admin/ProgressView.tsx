import { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, FileText, Send, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { TaggingProgressDto } from '../../types';

export const ProgressView = () => {
  const { token } = useAuth();
  const [progress, setProgress] = useState<TaggingProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await adminApi.getTaggingProgress(token);
      if (response.success) {
        setProgress(response.data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
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

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const totalAssigned = progress.reduce((s, p) => s + p.totalAssigned, 0);
  const totalApproved = progress.reduce((s, p) => s + p.totalApproved, 0);
  const totalSubmitted = progress.reduce((s, p) => s + p.totalSubmitted, 0);
  const totalSentBack = progress.reduce((s, p) => s + p.totalSentBack, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Assigned</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalAssigned}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Submitted for Review</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalSubmitted}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Sent Back</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalSentBack}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Approved</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalApproved}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Tagger Progress</h2>
          <span className="text-sm text-slate-500">
            {getProgressPercentage(totalApproved, totalAssigned)}% overall approved
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {progress.map((userProgress) => {
            const assigned = userProgress.totalAssigned;
            const approved = userProgress.totalApproved;
            const submitted = userProgress.totalSubmitted;
            const sentBack = userProgress.totalSentBack;
            const inProgress = userProgress.totalInProgress;

            const expandKey = String(userProgress.userId);

            return (
              <div key={userProgress.userId} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{userProgress.username}</h3>
                    <p className="text-sm text-slate-500">{approved} of {assigned} files approved</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {getProgressPercentage(approved, assigned)}%
                  </p>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary-800 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(approved, assigned)}%` }}
                    />
                  </div>
                </div>

                {/* Status breakdown pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 mb-1">In Progress</span>
                    <span className="text-lg font-bold text-slate-700">{inProgress < 0 ? 0 : inProgress}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-xs text-blue-600 mb-1">Submitted</span>
                    <span className="text-lg font-bold text-blue-700">{submitted}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-xs text-amber-600 mb-1">Sent Back</span>
                    <span className="text-lg font-bold text-amber-700">{sentBack}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-xs text-green-600 mb-1">Approved</span>
                    <span className="text-lg font-bold text-green-700">{approved}</span>
                  </div>
                </div>

                {/* Expandable approved files list */}
                {userProgress.completedFiles.length > 0 && (
                  <div className="space-y-2">
                    {(() => {
                      const isOpen = expandedUserId === userProgress.userId && expandedStatus === 'approved';
                      return (
                        <div>
                          <button
                            onClick={() => {
                              if (isOpen) {
                                setExpandedUserId(null);
                                setExpandedStatus(null);
                              } else {
                                setExpandedUserId(userProgress.userId);
                                setExpandedStatus('approved');
                              }
                            }}
                            className="text-sm font-medium text-green-700 hover:underline transition-colors"
                          >
                            {isOpen ? 'Hide' : 'Show'} Approved Files ({userProgress.completedFiles.length})
                          </button>
                          {isOpen && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                              {userProgress.completedFiles.map((file) => (
                                <div
                                  key={file.fileId}
                                  className="flex items-center justify-between px-3 py-2 bg-green-50 border-b border-slate-100 last:border-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="text-sm text-slate-800 truncate">{file.fileName}</span>
                                  </div>
                                  {file.completedAt && (
                                    <span className="text-xs text-slate-500 ml-3 shrink-0">
                                      {formatDate(file.completedAt)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}

          {progress.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No progress data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

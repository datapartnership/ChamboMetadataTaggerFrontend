import { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { TaggingProgressDto } from '../../types';

export const ProgressView = () => {
  const { token } = useAuth();
  const [progress, setProgress] = useState<TaggingProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-teal-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-teal-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Assigned</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {progress.reduce((sum, p) => sum + p.totalAssigned, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Total Completed</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {progress.reduce((sum, p) => sum + p.totalCompleted, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-600">Overall Progress</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {getProgressPercentage(
              progress.reduce((sum, p) => sum + p.totalCompleted, 0),
              progress.reduce((sum, p) => sum + p.totalAssigned, 0)
            )}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Tagger Progress</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {progress.map((userProgress) => (
            <div key={userProgress.userId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {userProgress.username}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {userProgress.totalCompleted} of {userProgress.totalAssigned} files completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {getProgressPercentage(userProgress.totalCompleted, userProgress.totalAssigned)}%
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-primary-800 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(
                        userProgress.totalCompleted,
                        userProgress.totalAssigned
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {userProgress.completedFiles.length > 0 && (
                <div>
                  <button
                    onClick={() =>
                      setExpandedUserId(
                        expandedUserId === userProgress.userId ? null : userProgress.userId
                      )
                    }
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {expandedUserId === userProgress.userId ? 'Hide' : 'Show'} completed files
                  </button>

                  {expandedUserId === userProgress.userId && (
                    <div className="mt-4 space-y-2">
                      {userProgress.completedFiles.map((file) => (
                        <div
                          key={file.fileId}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">
                              {file.fileName}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600">
                            {formatDate(file.completedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

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

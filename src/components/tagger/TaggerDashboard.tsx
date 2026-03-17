import { useState, useEffect } from 'react';
import { LogOut, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { taggerApi } from '../../services/api';
import { FileMetadataDto } from '../../types';
import { TagEditor } from './TagEditor';

export const TaggerDashboard = () => {
  const { user, logout, token } = useAuth();
  const [files, setFiles] = useState<FileMetadataDto[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMetadataDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [token]);

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await taggerApi.getMyFiles(token);
      if (response.success) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpdate = () => {
    setSelectedFile(null);
    loadFiles();
  };

  const completedCount = files.filter(f => f.status === 'Completed').length;
  const inProgressCount = files.filter(f => f.status === 'InProgress' || f.status === 'NeedsRevision').length;
  const needsRevisionCount = files.filter(f => f.status === 'NeedsRevision').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/chambo_logo.png"
                alt="Chambo Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Chambo Metadata Tagger</h1>
                <p className="text-sm text-slate-600">Tagger Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-600">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Assigned</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{files.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-teal-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-teal-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">In Progress</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                needsRevisionCount > 0 ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  needsRevisionCount > 0 ? 'text-amber-600' : 'text-slate-400'
                }`} />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Needs Revision</h3>
            </div>
            <p className={`text-3xl font-bold ${
              needsRevisionCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>{needsRevisionCount}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Files</h2>

            {loading ? (
              <div className="text-center py-8 text-slate-600">Loading files...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No files assigned</p>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`flex-shrink-0 p-4 rounded-xl transition-all hover:shadow-md min-w-[200px] ${
                      selectedFile?.id === file.id
                        ? 'bg-primary-800 text-white shadow-lg'
                        : 'bg-slate-50 hover:bg-accent-teal-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        selectedFile?.id === file.id ? 'text-white' : 'text-slate-600'
                      }`} />
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`font-medium truncate ${
                          selectedFile?.id === file.id ? 'text-white' : 'text-slate-900'
                        }`}>
                          {file.fileName}
                        </p>
                    <div className="flex items-center gap-2 mt-1">
                          {file.status === 'NeedsRevision' ? (
                            <AlertTriangle className={`w-3 h-3 ${
                              selectedFile?.id === file.id ? 'text-amber-300' : 'text-amber-500'
                            }`} />
                          ) : file.status === 'Completed' ? (
                            <CheckCircle className={`w-3 h-3 ${
                              selectedFile?.id === file.id ? 'text-green-300' : 'text-green-600'
                            }`} />
                          ) : (
                            <Clock className={`w-3 h-3 ${
                              selectedFile?.id === file.id ? 'text-blue-300' : 'text-accent-teal-600'
                            }`} />
                          )}
                          <span className={`text-xs ${
                            selectedFile?.id === file.id ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            {file.status === 'NeedsRevision' ? 'Needs Revision' : `${file.tags.length} tag${file.tags.length !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedFile ? (
            <TagEditor file={selectedFile} onUpdate={handleFileUpdate} />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No File Selected
              </h3>
              <p className="text-slate-600">
                Select a file from the list to add metadata tags
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { LogOut, Users, FileCheck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { StudentWithStatsDto } from '../../types';
import { StudentsView } from './StudentsView';
import { ReviewView } from './ReviewView';

type ViewType = 'students' | 'review';

export const SupervisorDashboard = () => {
  const { user, logout, token } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('students');
  const [students, setStudents] = useState<StudentWithStatsDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStudents();
    }
  }, [token]);

  const loadStudents = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching students with token:', token.substring(0, 20) + '...');
      const response = await supervisorApi.getMyStudents(token);
      console.log('Students API response:', response);

      if (response.success && response.data && response.data.length > 0) {
        console.log('Number of students:', response.data.length);
        console.log('Students data:', response.data);
        setStudents(response.data);
      } else {
        console.log('No students from my-students endpoint, trying to derive from files...');
        const filesResponse = await supervisorApi.getAllStudentFiles(token);
        console.log('Files response:', filesResponse);

        if (filesResponse.success && filesResponse.data && filesResponse.data.length > 0) {
          const studentMap = new Map<number, StudentWithStatsDto>();

          filesResponse.data.forEach(file => {
            if (!studentMap.has(file.studentId)) {
              studentMap.set(file.studentId, {
                studentId: file.studentId,
                username: file.studentUsername,
                email: '',
                totalAssigned: 0,
                totalCompleted: 0,
                inProgress: 0,
                recentFiles: []
              });
            }

            const student = studentMap.get(file.studentId)!;
            student.totalAssigned++;

            if (file.status === 'Completed' || file.status === 'Checked') {
              student.totalCompleted++;
            } else if (file.status === 'InProgress' || file.status === 'Assigned') {
              student.inProgress++;
            }

            if (student.recentFiles.length < 5) {
              student.recentFiles.push({
                id: file.fileId,
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                blobName: file.blobName,
                fileSize: 0,
                contentType: '',
                uploadedAt: '',
                status: file.status,
                taggingCompletedAt: file.completedAt,
                tags: file.tags,
                assignedToUserIds: [file.studentId]
              });
            }
          });

          const derivedStudents = Array.from(studentMap.values());
          console.log('Derived students:', derivedStudents);
          setStudents(derivedStudents);
        } else {
          console.log('No files found either');
          setStudents([]);
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAssigned = students.reduce((sum, s) => sum + s.totalAssigned, 0);
  const totalCompleted = students.reduce((sum, s) => sum + s.totalCompleted, 0);
  const totalInProgress = students.reduce((sum, s) => sum + s.inProgress, 0);

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
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-bold text-slate-900">Chambo Metadata Tagger</h1>
                  <span className="text-xs font-medium text-slate-400">v{__APP_VERSION__}</span>
                </div>
                <p className="text-sm text-slate-600">Supervisor Dashboard</p>
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
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Students</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{students.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Total Files</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalAssigned}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-teal-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-teal-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">In Progress</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalInProgress}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalCompleted}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setCurrentView('students')}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  currentView === 'students'
                    ? 'border-primary-800 text-primary-900'
                    : 'border-transparent text-slate-600 hover:text-primary-900'
                }`}
              >
                Students Overview
              </button>
              <button
                onClick={() => setCurrentView('review')}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  currentView === 'review'
                    ? 'border-primary-800 text-primary-900'
                    : 'border-transparent text-slate-600 hover:text-primary-900'
                }`}
              >
                Review Taggings
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-slate-600">Loading...</div>
            ) : currentView === 'students' ? (
              <StudentsView students={students} />
            ) : (
              <ReviewView />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

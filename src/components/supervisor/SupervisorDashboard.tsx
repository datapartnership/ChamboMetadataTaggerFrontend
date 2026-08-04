import { useState, useEffect } from 'react';
import { LogOut, Users, FileCheck, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { StudentWithStatsDto } from '../../types';
import { StudentsView } from './StudentsView';
import { ReviewView } from './ReviewView';
import { Pagination } from '../Pagination';

type ViewType = 'students' | 'review';

export const SupervisorDashboard = () => {
  const { user, logout, token } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('students');
  const [students, setStudents] = useState<StudentWithStatsDto[]>([]);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsPageSize, setStudentsPageSize] = useState(10);
  const [studentsTotalCount, setStudentsTotalCount] = useState(0);
  const [studentsTotalPages, setStudentsTotalPages] = useState(0);
  const [studentsHasNextPage, setStudentsHasNextPage] = useState(false);
  const [studentsHasPreviousPage, setStudentsHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadStudents();
    }
  }, [token, studentsPage, studentsPageSize]);

  const loadStudents = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching students with token:', token.substring(0, 20) + '...');
      const response = await supervisorApi.getMyStudents(token, {
        page: studentsPage,
        pageSize: studentsPageSize,
      });
      console.log('Students API response:', response);

      if (response.success) {
        setStudents(response.data.items);
        setStudentsTotalCount(response.data.totalCount);
        setStudentsTotalPages(response.data.totalPages);
        setStudentsHasNextPage(response.data.hasNextPage);
        setStudentsHasPreviousPage(response.data.hasPreviousPage);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAssigned = students.reduce((sum, s) => sum + s.totalAssigned, 0);
  const totalApproved = students.reduce((sum, s) => sum + s.approvedCount, 0);
  const totalSubmitted = students.reduce((sum, s) => sum + s.submittedToSupervisorCount, 0);

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
            <p className="text-3xl font-bold text-slate-900">{studentsTotalCount}</p>
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
              <h3 className="text-sm font-medium text-slate-600">Submitted to Supervisor</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalSubmitted}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-600">Approved</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalApproved}</p>
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
              <>
                <StudentsView students={students} />
                <Pagination
                  page={studentsPage}
                  totalPages={studentsTotalPages}
                  totalCount={studentsTotalCount}
                  pageSize={studentsPageSize}
                  hasNextPage={studentsHasNextPage}
                  hasPreviousPage={studentsHasPreviousPage}
                  onPageChange={(p) => setStudentsPage(p)}
                  onPageSizeChange={(s) => { setStudentsPageSize(s); setStudentsPage(1); }}
                />
              </>
            ) : (
              <ReviewView />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

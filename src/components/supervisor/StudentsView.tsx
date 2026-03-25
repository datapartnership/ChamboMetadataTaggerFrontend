import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { StudentWithStatsDto } from '../../types';

interface StudentsViewProps {
  students: StudentWithStatsDto[];
}

export const StudentsView = ({ students }: StudentsViewProps) => {
  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Students Assigned</h3>
        <p className="text-slate-600">You don't have any students assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => {
        const completionRate = student.totalAssigned > 0
          ? Math.round((student.totalCompleted / student.totalAssigned) * 100)
          : 0;

        return (
          <div key={student.studentId} className="bg-slate-50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{student.username}</h3>
                <p className="text-sm text-slate-600">{student.email}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-900">{completionRate}% Complete</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-600">Total Assigned</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{student.totalAssigned}</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-accent-teal-600" />
                  <span className="text-xs font-medium text-slate-600">In Progress</span>
                </div>
                <p className="text-2xl font-bold text-accent-teal-600">{student.inProgress}</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-slate-600">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{student.totalCompleted}</p>
              </div>
            </div>

            {student.recentFiles && student.recentFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {student.recentFiles.slice(0, 3).map((file) => (
                    <div key={file.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-slate-500">{file.tags.length} tags</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        file.status === 'ApprovedBySupervisor'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-accent-teal-100 text-blue-700'
                      }`}>
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

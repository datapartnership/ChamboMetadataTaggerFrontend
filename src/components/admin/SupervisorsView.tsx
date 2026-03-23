import { useState, useEffect } from 'react';
import { UserCheck, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { User, StudentSupervisorDto } from '../../types';

export const SupervisorsView = () => {
  const { token } = useAuth();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<StudentSupervisorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [usersResponse, assignmentsResponse] = await Promise.all([
        adminApi.getUsers(token),
        adminApi.getSupervisorAssignments(token),
      ]);

      if (usersResponse.success) {
        const allUsers = usersResponse.data;
        setSupervisors(allUsers.filter(u => u.role === 'Supervisor'));
        setStudents(allUsers.filter(u => u.role === 'Tagger'));
      }

      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignedStudents = (supervisorId: number) => {
    return assignments.filter(a => a.supervisorId === supervisorId && a.isActive);
  };

  const getUnassignedStudents = (supervisorId: number) => {
    const assignedStudentIds = assignments
      .filter(a => a.supervisorId === supervisorId && a.isActive)
      .map(a => a.studentId);
    return students.filter(s => !assignedStudentIds.includes(s.id));
  };

  const handleOpenAssignModal = (supervisor: User) => {
    setSelectedSupervisor(supervisor);
    setShowAssignModal(true);
  };

  const handleUnassign = async (supervisorId: number, studentId: number) => {
    if (!token) return;

    try {
      const response = await adminApi.unassignStudentFromSupervisor(token, {
        supervisorId,
        studentId,
      });

      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading...</div>;
  }

  if (supervisors.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Supervisors</h3>
        <p className="text-slate-600">Create a supervisor user to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Supervisor Assignments</h2>

        <div className="space-y-4">
          {supervisors.map((supervisor) => {
            const assignedStudents = getAssignedStudents(supervisor.id);

            return (
              <div key={supervisor.id} className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{supervisor.username}</h3>
                    <p className="text-sm text-slate-600">{supervisor.email}</p>
                  </div>
                  <button
                    onClick={() => handleOpenAssignModal(supervisor)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Assign Student
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Assigned Taggers ({assignedStudents.length})
                  </h4>

                  {assignedStudents.length === 0 ? (
                    <div className="bg-white rounded-lg p-4 text-center text-sm text-slate-500">
                      No taggers assigned
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {assignedStudents.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {assignment.studentUsername}
                            </p>
                            <p className="text-xs text-slate-600">{assignment.studentEmail}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnassign(assignment.supervisorId, assignment.studentId)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Unassign student"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAssignModal && selectedSupervisor && (
        <AssignStudentModal
          supervisor={selectedSupervisor}
          availableStudents={getUnassignedStudents(selectedSupervisor.id)}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedSupervisor(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedSupervisor(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

interface AssignStudentModalProps {
  supervisor: User;
  availableStudents: User[];
  onClose: () => void;
  onSuccess: () => void;
}

const AssignStudentModal = ({ supervisor, availableStudents, onClose, onSuccess }: AssignStudentModalProps) => {
  const { token } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!token || !selectedStudentId) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminApi.assignStudentToSupervisor(token, {
        supervisorId: supervisor.id,
        studentId: selectedStudentId,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to assign tagger');
      }
    } catch (err) {
      setError('An error occurred while assigning tagger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Assign Tagger</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Assign a tagger to {supervisor.username}
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {availableStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <p>All taggers are already assigned to this supervisor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Tagger
              </label>
              {availableStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    selectedStudentId === student.id
                      ? 'border-primary-800 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{student.username}</p>
                  <p className="text-sm text-slate-600">{student.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedStudentId || availableStudents.length === 0}
            className="flex-1 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Assigning...' : 'Assign Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

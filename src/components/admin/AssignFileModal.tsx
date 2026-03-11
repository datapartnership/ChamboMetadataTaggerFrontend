import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { FileMetadataDto, User } from '../../types';

interface AssignFileModalProps {
  file: FileMetadataDto;
  taggers: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignFileModal = ({ file, taggers, onClose, onSuccess }: AssignFileModalProps) => {
  const { token } = useAuth();
  const [selectedTaggerId, setSelectedTaggerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!token || !selectedTaggerId) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminApi.assignFile(token, {
        fileId: file.id,
        userId: selectedTaggerId,
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to assign file');
      }
    } catch (err) {
      setError('An error occurred while assigning the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Assign File</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-1">File</p>
            <p className="text-slate-900 break-all">{file.fileName}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to Tagger
            </label>
            <select
              value={selectedTaggerId || ''}
              onChange={(e) => setSelectedTaggerId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
            >
              <option value="">Select a tagger...</option>
              {taggers.map((tagger) => (
                <option key={tagger.id} value={tagger.id}>
                  {tagger.username} ({tagger.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedTaggerId || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

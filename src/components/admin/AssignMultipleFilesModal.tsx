import { useState } from 'react';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import { User, BlobFileDto } from '../../types';

interface AssignMultipleFilesModalProps {
  selectedBlobs: BlobFileDto[];
  taggers: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignMultipleFilesModal = ({
  selectedBlobs,
  taggers,
  onClose,
  onSuccess,
}: AssignMultipleFilesModalProps) => {
  const { token } = useAuth();
  const [selectedTaggerId, setSelectedTaggerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    successfullyAssigned: number;
    failed: number;
    failedBlobNames: string[];
  } | null>(null);

  const handleAssign = async () => {
    if (!token || !selectedTaggerId) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await adminApi.assignMultipleFiles(token, {
        blobNames: selectedBlobs.map((b) => b.blobName),
        userId: selectedTaggerId,
      });

      if (response.success) {
        const data = response.data;
        if (data.failed === 0) {
          onSuccess();
        } else {
          setResult({
            successfullyAssigned: data.successfullyAssigned,
            failed: data.failed,
            failedBlobNames: data.failedBlobNames,
          });
        }
      } else {
        setError(response.message || 'Failed to assign files');
      }
    } catch (err) {
      setError('An error occurred while assigning the files');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (blobName: string) => {
    return blobName.split('/').pop() || blobName;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Assign {selectedBlobs.length} Item{selectedBlobs.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Successfully assigned {result.successfullyAssigned} item{result.successfullyAssigned !== 1 ? 's' : ''}.
              </div>
              {result.failed > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    {result.failed} item{result.failed !== 1 ? 's' : ''} could not be assigned:
                  </div>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {result.failedBlobNames.map((blobName) => (
                      <li key={blobName}>{getDisplayName(blobName)}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={onSuccess}
                className="w-full px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {!result && (
            <>
              {/* Selected Items List */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selected Items ({selectedBlobs.length})
                </label>
                <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                  {selectedBlobs.map((blob) => (
                    <div
                      key={blob.blobName}
                      className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 last:border-b-0 text-sm text-slate-700"
                    >
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="truncate">{getDisplayName(blob.blobName)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tagger Selection */}
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
                  {loading ? 'Assigning...' : `Assign All (${selectedBlobs.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink, User, Calendar, Tag as TagIcon } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { SupervisorReviewDto, FilePreviewDto } from '../../types';

interface ReviewFileModalProps {
  file: SupervisorReviewDto;
  onClose: () => void;
  onReviewed: () => void;
}

export const ReviewFileModal = ({ file, onClose, onReviewed }: ReviewFileModalProps) => {
  const { token } = useAuth();
  const [preview, setPreview] = useState<FilePreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState('');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [notes, setNotes] = useState(file.supervisorNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreview();
  }, [file.fileId]);

  const loadPreview = async () => {
    if (!token) return;

    setLoadingPreview(true);
    setPreviewError('');
    setMarkdownContent('');

    try {
      const response = await supervisorApi.getFilePreview(token, file.fileId);
      if (response.success) {
        setPreview(response.data);

        const isMarkdown = response.data.contentType === 'text/markdown' ||
                          response.data.fileName?.endsWith('.md') ||
                          response.data.blobName?.endsWith('.md');

        if (isMarkdown && response.data.previewUrl) {
          try {
            const mdResponse = await fetch(response.data.previewUrl);
            const mdText = await mdResponse.text();
            setMarkdownContent(mdText);
          } catch (err) {
            console.error('Error fetching markdown content:', err);
            setPreviewError('Failed to load markdown content');
          }
        }
      } else {
        setPreviewError(response.message || 'Failed to load preview');
      }
    } catch (err) {
      setPreviewError('An error occurred while loading the preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleMarkAsChecked = async () => {
    if (!token) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await supervisorApi.markFileChecked(token, {
        fileId: file.fileId,
        studentId: file.studentId,
        notes: notes.trim(),
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'File marked as reviewed!' });
        setTimeout(() => onReviewed(), 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to mark file as reviewed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = preview?.contentType?.startsWith('image/');
  const isPdf = preview?.contentType === 'application/pdf';
  const isVideo = preview?.contentType?.startsWith('video/');
  const isMarkdown = preview?.contentType === 'text/markdown' ||
                     preview?.fileName?.endsWith('.md') ||
                     preview?.blobName?.endsWith('.md');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Review File</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3">File Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Student:</span>
                    <span className="font-medium text-slate-900">{file.studentUsername}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-600">Completed:</span>
                    <span className="font-medium text-slate-900">
                      {file.completedAt ? new Date(file.completedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">File name:</p>
                    <p className="font-medium text-slate-900 break-all">{file.fileName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-4 h-4 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Tags</h3>
                </div>
                {file.tags.length === 0 ? (
                  <p className="text-sm text-slate-600">No tags added</p>
                ) : (
                  <div className="space-y-2">
                    {file.tags.map((tag, index) => (
                      <div key={index} className="bg-white rounded-lg p-3">
                        <div className="text-xs font-medium text-slate-600 mb-1">{tag.tagKey}</div>
                        <div className="text-sm text-slate-900">{tag.tagValue}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!file.isCheckedBySupervisor && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Review Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent resize-none"
                    placeholder="Add any notes or feedback for this review..."
                    rows={4}
                  />
                </div>
              )}

              {file.isCheckedBySupervisor && file.supervisorNotes && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Review Notes</h3>
                  <p className="text-sm text-slate-600">{file.supervisorNotes}</p>
                  {file.checkedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Reviewed on {new Date(file.checkedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <h3 className="font-semibold text-slate-900">File Preview</h3>
                {preview?.previewUrl && (
                  <a
                    href={preview.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </a>
                )}
              </div>

              <div className="p-4 h-[500px] overflow-auto">
                {loadingPreview && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-slate-600">Loading preview...</div>
                  </div>
                )}

                {previewError && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-800">{previewError}</p>
                    </div>
                  </div>
                )}

                {!loadingPreview && !previewError && preview && (
                  <div className="flex items-center justify-center min-h-full">
                    {isImage && (
                      <img
                        src={preview.previewUrl}
                        alt={file.fileName}
                        className="max-w-full h-auto object-contain rounded-lg shadow-lg"
                      />
                    )}

                    {isPdf && (
                      <iframe
                        src={preview.previewUrl}
                        className="w-full h-[460px] border border-slate-200 rounded-lg"
                        title={file.fileName}
                      />
                    )}

                    {isVideo && (
                      <video
                        src={preview.previewUrl}
                        controls
                        className="max-w-full h-auto rounded-lg shadow-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}

                    {isMarkdown && markdownContent && (
                      <div
                        className="prose prose-slate max-w-none w-full text-left"
                        dangerouslySetInnerHTML={{ __html: marked(markdownContent) }}
                      />
                    )}

                    {!isImage && !isPdf && !isVideo && !isMarkdown && (
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">Preview not available for this file type</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {!file.isCheckedBySupervisor && (
            <button
              onClick={handleMarkAsChecked}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Marking as Reviewed...' : 'Mark as Reviewed'}
            </button>
          )}
          {file.isCheckedBySupervisor && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Already Reviewed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

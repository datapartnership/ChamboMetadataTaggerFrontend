import { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import { FilePreviewDto, TagDto } from '../types';

interface FilePreviewModalProps {
  fileId: number;
  fileName: string;
  getPreview: (token: string, fileId: number) => Promise<any>;
  onClose: () => void;
  tags?: TagDto[];
  status?: string;
}

export const FilePreviewModal = ({ fileId, fileName, getPreview, onClose, tags, status }: FilePreviewModalProps) => {
  const { token } = useAuth();
  const [preview, setPreview] = useState<FilePreviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markdownContent, setMarkdownContent] = useState<string>('');

  useEffect(() => {
    loadPreview();
  }, [fileId]);

  const loadPreview = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    setMarkdownContent('');

    try {
      const response = await getPreview(token, fileId);
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
            setError('Failed to load markdown content');
          }
        }
      } else {
        setError(response.message || 'Failed to load preview');
      }
    } catch (err) {
      setError('An error occurred while loading the preview');
    } finally {
      setLoading(false);
    }
  };

  const isImage = preview?.contentType?.startsWith('image/');
  const isPdf = preview?.contentType === 'application/pdf';
  const isVideo = preview?.contentType?.startsWith('video/');
  const isMarkdown = preview?.contentType === 'text/markdown' ||
                     preview?.fileName?.endsWith('.md') ||
                     preview?.blobName?.endsWith('.md');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{fileName}</h2>
            {preview && (
              <p className="text-sm text-slate-600 mt-1">
                {preview.contentType} • {(preview.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {preview?.previewUrl && (
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-600">Loading preview...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && preview && (
            <div className="flex items-center justify-center min-h-[400px]">
              {isImage && (
                <img
                  src={preview.previewUrl}
                  alt={fileName}
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                />
              )}

              {isPdf && (
                <iframe
                  src={preview.previewUrl}
                  className="w-full h-[600px] border border-slate-200 rounded-lg"
                  title={fileName}
                />
              )}

              {isVideo && (
                <video
                  src={preview.previewUrl}
                  controls
                  className="max-w-full max-h-[600px] rounded-lg shadow-lg"
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
                  <p className="text-slate-600 mb-4">Preview not available for this file type</p>
                  <a
                    href={preview.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="p-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-800 border border-primary-200"
                >
                  <span className="font-semibold">{tag.tagKey}:</span>
                  <span>{tag.tagValue}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {preview && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
            Preview URL expires: {new Date(preview.expiresAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

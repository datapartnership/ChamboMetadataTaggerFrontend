import { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import { FilePreviewDto } from '../types';

interface BlobPreviewModalProps {
  blobName: string;
  getPreview: (token: string, blobName: string) => Promise<any>;
  onClose: () => void;
}

export const BlobPreviewModal = ({ blobName, getPreview, onClose }: BlobPreviewModalProps) => {
  const { token } = useAuth();
  const [preview, setPreview] = useState<FilePreviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markdownContent, setMarkdownContent] = useState<string>('');

  useEffect(() => {
    loadPreview();
  }, [blobName]);

  const loadPreview = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    setMarkdownContent('');

    try {
      const response = await getPreview(token, blobName);
      if (response.success) {
        setPreview(response.data);

        const isMarkdown = response.data.contentType === 'text/markdown' ||
                          response.data.fileName?.endsWith('.md') ||
                          response.data.blobName?.endsWith('.md') ||
                          blobName.endsWith('.md');

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
                     preview?.blobName?.endsWith('.md') ||
                     blobName.endsWith('.md');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">{blobName}</h2>
            {preview && (
              <p className="text-sm text-slate-600 mt-1">
                {preview.contentType} • {(preview.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
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
                  alt={blobName}
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                />
              )}

              {isPdf && (
                <iframe
                  src={preview.previewUrl}
                  className="w-full h-[600px] border border-slate-200 rounded-lg"
                  title={blobName}
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

        {preview && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
            Preview URL expires: {new Date(preview.expiresAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle, AlertCircle, ExternalLink, X } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../../context/AuthContext';
import { taggerApi } from '../../services/api';
import { FileMetadataDto, TagDto, FilePreviewDto } from '../../types';
import { ThemeSelector } from './ThemeSelector';
import { SelectedTheme, formatThemeDisplay } from '../../data/unbisThesaurus';

interface TagEditorProps {
  file: FileMetadataDto;
  onUpdate: () => void;
}

const PREDEFINED_TAGS = ['Title', 'Author', 'Keywords'];
const MAX_THEMES = 3;

export const TagEditor = ({ file, onUpdate }: TagEditorProps) => {
  const { token } = useAuth();
  const [tagValues, setTagValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    PREDEFINED_TAGS.forEach(key => {
      const existingTag = file.tags?.find(t => t.tagKey === key);
      initialValues[key] = existingTag?.tagValue || '';
    });
    return initialValues;
  });
  const [keywords, setKeywords] = useState<string[]>(() => {
    const existingTag = file.tags?.find(t => t.tagKey === 'Keywords');
    return existingTag?.tagValue ? existingTag.tagValue.split(',').map(k => k.trim()).filter(k => k) : [];
  });
  const [selectedThemes, setSelectedThemes] = useState<SelectedTheme[]>(() => {
    const existingTag = file.tags?.find(t => t.tagKey === 'Theme');
    if (!existingTag?.tagValue) return [];
    
    // Parse stored themes - format: "Theme1 > SubTheme1 | Theme2"
    return existingTag.tagValue.split(' | ').map(themeStr => {
      const parts = themeStr.split(' > ');
      if (parts.length === 2) {
        return {
          level1Code: '',
          level1Name: parts[0].trim(),
          level2Code: '',
          level2Name: parts[1].trim(),
        };
      }
      return {
        level1Code: '',
        level1Name: parts[0].trim(),
      };
    }).filter(t => t.level1Name);
  });
  const [keywordInput, setKeywordInput] = useState('');
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [preview, setPreview] = useState<FilePreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState('');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreview();
  }, [file.id]);

  const loadPreview = async () => {
    if (!token) return;

    setLoadingPreview(true);
    setPreviewError('');
    setMarkdownContent('');

    try {
      const response = await taggerApi.getFilePreview(token, file.id);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const updateTagValue = (key: string, value: string) => {
    setTagValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(prev => prev.filter(k => k !== keywordToRemove));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(keywordInput);
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    setMessage(null);

    try {
      const tags: TagDto[] = PREDEFINED_TAGS
        .filter(key => key !== 'Keywords' && tagValues[key]?.trim())
        .map(key => ({
          tagKey: key,
          tagValue: tagValues[key].trim()
        }));

      if (keywords.length > 0) {
        tags.push({
          tagKey: 'Keywords',
          tagValue: keywords.join(', ')
        });
      }

      // Add themes
      if (selectedThemes.length > 0) {
        const themeValue = selectedThemes
          .map(theme => formatThemeDisplay(theme))
          .join(' | ');
        tags.push({
          tagKey: 'Theme',
          tagValue: themeValue
        });
      }

      const response = await taggerApi.addTags(token, file.id, { tags });

      if (response.success) {
        setMessage({ type: 'success', text: 'Tags saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save tags' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving tags' });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!token || !confirm('Mark this file as completed?')) return;

    setCompleting(true);
    setMessage(null);

    try {
      const response = await taggerApi.completeFile(token, file.id);

      if (response.success) {
        setMessage({ type: 'success', text: 'File marked as completed!' });
        setTimeout(() => onUpdate(), 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to complete file' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while completing file' });
    } finally {
      setCompleting(false);
    }
  };

  const isImage = preview?.contentType?.startsWith('image/');
  const isPdf = preview?.contentType === 'application/pdf';
  const isVideo = preview?.contentType?.startsWith('video/');
  const isMarkdown = preview?.contentType === 'text/markdown' ||
                     preview?.fileName?.endsWith('.md') ||
                     preview?.blobName?.endsWith('.md');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-900">File Preview</h3>
          {preview?.previewUrl && (
            <a
              href={preview.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
            </a>
          )}
        </div>

        <div className="p-4 h-[calc(100vh-320px)] overflow-auto">
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
                  className="w-full h-[calc(100vh-360px)] border border-slate-200 rounded-lg"
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
                  className="prose prose-slate max-w-none w-full p-6 bg-white rounded-lg overflow-auto"
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

        {preview && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
            Preview expires: {new Date(preview.expiresAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">File Tags</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            {file.status !== 'Completed' && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {completing ? 'Completing...' : 'Complete'}
              </button>
            )}
          </div>
        </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">File Name</p>
          <p className="text-slate-900 break-all">{file.fileName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Size</p>
            <p className="text-slate-900">{formatFileSize(file.fileSize)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Type</p>
            <p className="text-slate-900">{file.contentType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
              file.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-accent-teal-100 text-blue-800'
            }`}>
              {file.status === 'Completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Metadata Tags
        </label>

        <div className="space-y-4">
          {PREDEFINED_TAGS.map((tagKey) => (
            <div key={tagKey}>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                {tagKey}
              </label>
              {tagKey === 'Keywords' ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-700 focus-within:border-transparent">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all"
                      >
                        <span className="text-primary-100">#</span>
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:bg-primary-700 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      ref={keywordInputRef}
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      className="flex-1 min-w-[120px] outline-none bg-transparent text-slate-900 placeholder-slate-400"
                      placeholder={keywords.length === 0 ? "Type keyword and press Enter..." : "Add more..."}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Press <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono">Enter</kbd> to add keyword, <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 font-mono">Backspace</kbd> to remove last
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  value={tagValues[tagKey]}
                  onChange={(e) => updateTagValue(tagKey, e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                  placeholder={`Enter ${tagKey.toLowerCase()}`}
                />
              )}
            </div>
          ))}

          {/* Theme Selector - UNBIS Thesaurus */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Theme (UNBIS Thesaurus)
            </label>
            <ThemeSelector
              selectedThemes={selectedThemes}
              onChange={setSelectedThemes}
              maxThemes={MAX_THEMES}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

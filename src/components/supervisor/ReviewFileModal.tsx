import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, ExternalLink, User, Calendar, Tag as TagIcon, Edit2, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import { useAuth } from '../../context/AuthContext';
import { supervisorApi } from '../../services/api';
import { SupervisorReviewDto, FilePreviewDto, TagDto } from '../../types';
import { ThemeSelector } from '../tagger/ThemeSelector';
import { SelectedTheme, formatThemeDisplay } from '../../data/unbisThesaurus';

const MAX_THEMES = 3;

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

  // Tag editing state
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editableTags, setEditableTags] = useState<TagDto[]>([]);
  const [editTagNotes, setEditTagNotes] = useState('');

  // Keyword/theme editing state
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const keywordInputRef = useRef<HTMLInputElement>(null);
  const [selectedThemes, setSelectedThemes] = useState<SelectedTheme[]>([]);

  // Send back state
  const [isSendingBack, setIsSendingBack] = useState(false);
  const [sendBackNotes, setSendBackNotes] = useState('');

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

  const handleStartEditTags = () => {
    const keywordsTag = file.tags.find(t => t.tagKey === 'Keywords');
    const themeTag = file.tags.find(t => t.tagKey === 'Theme');
    setEditableTags(file.tags.filter(t => t.tagKey !== 'Keywords' && t.tagKey !== 'Theme').map(t => ({ ...t })));
    setKeywords(keywordsTag?.tagValue ? keywordsTag.tagValue.split(',').map(k => k.trim()).filter(k => k) : []);
    setSelectedThemes(themeTag?.tagValue ? themeTag.tagValue.split(' | ').map(themeStr => {
      const parts = themeStr.split(' > ');
      if (parts.length === 2) {
        return { level1Code: '', level1Name: parts[0].trim(), level2Code: '', level2Name: parts[1].trim() };
      }
      return { level1Code: '', level1Name: parts[0].trim() };
    }).filter(t => t.level1Name) : []);
    setEditTagNotes('');
    setIsEditingTags(true);
    setMessage(null);
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

  const handleSaveEditedTags = async () => {
    if (!token) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const allTags: TagDto[] = [...editableTags.filter(t => t.tagKey.trim())];
      if (keywords.length > 0) {
        allTags.push({ tagKey: 'Keywords', tagValue: keywords.join(', ') });
      }
      if (selectedThemes.length > 0) {
        allTags.push({ tagKey: 'Theme', tagValue: selectedThemes.map(t => formatThemeDisplay(t)).join(' | ') });
      }

      const response = await supervisorApi.editFileTags(token, file.fileId, {
        studentId: file.studentId,
        tags: allTags,
        notes: editTagNotes.trim(),
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Tags updated successfully!' });
        setIsEditingTags(false);
        setTimeout(() => onReviewed(), 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update tags' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBackToTagger = async () => {
    if (!token) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await supervisorApi.sendBackToTagger(token, {
        fileId: file.fileId,
        studentId: file.studentId,
        notes: sendBackNotes.trim(),
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'File sent back to tagger for revision.' });
        setTimeout(() => onReviewed(), 1500);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to send back to tagger' });
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Tags</h3>
                  </div>
                  {!isEditingTags && !isSendingBack && (
                    <button
                      onClick={handleStartEditTags}
                      className="flex items-center gap-1 text-xs px-2 py-1 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit Tags
                    </button>
                  )}
                </div>

                {isEditingTags ? (
                  <div className="space-y-3">
                    {/* Other tags */}
                    {editableTags.map((tag, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={tag.tagKey}
                          onChange={(e) => {
                            const updated = [...editableTags];
                            updated[index] = { ...updated[index], tagKey: e.target.value };
                            setEditableTags(updated);
                          }}
                          className="w-1/3 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-700"
                          placeholder="Key"
                        />
                        <textarea
                          value={tag.tagValue}
                          onChange={(e) => {
                            const updated = [...editableTags];
                            updated[index] = { ...updated[index], tagValue: e.target.value };
                            setEditableTags(updated);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-700 resize-none"
                          placeholder="Value"
                          rows={2}
                        />
                        <button
                          onClick={() => setEditableTags(editableTags.filter((_, i) => i !== index))}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditableTags([...editableTags, { tagKey: '', tagValue: '' }])}
                      className="flex items-center gap-1 text-xs text-primary-700 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Tag
                    </button>

                    {/* Keywords */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Keywords</label>
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white border border-slate-200 rounded-lg focus-within:ring-1 focus-within:ring-primary-700">
                        {keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-medium rounded-full"
                          >
                            <span className="text-primary-100">#</span>
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-0.5 hover:bg-primary-700 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          ref={keywordInputRef}
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleKeywordKeyDown}
                          className="flex-1 min-w-[100px] outline-none bg-transparent text-xs text-slate-900 placeholder-slate-400"
                          placeholder={keywords.length === 0 ? 'Type keyword and press Enter...' : 'Add more...'}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-[10px]">Enter</kbd> to add, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono text-[10px]">Backspace</kbd> to remove last
                      </p>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Theme (UNBIS Thesaurus)</label>
                      <ThemeSelector
                        selectedThemes={selectedThemes}
                        onChange={setSelectedThemes}
                        maxThemes={MAX_THEMES}
                      />
                    </div>

                    <div className="mt-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
                      <textarea
                        value={editTagNotes}
                        onChange={(e) => setEditTagNotes(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-700 resize-none"
                        placeholder="Notes about your edits..."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  file.tags.length === 0 ? (
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
                  )
                )}
              </div>

              {!isEditingTags && !file.isCheckedBySupervisor && file.status !== 'NeedsRevision' && (
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

              {!isEditingTags && file.status !== 'NeedsRevision' && !isSendingBack && !file.isCheckedBySupervisor && (
                <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-amber-900 text-sm">Send Back for Revision</h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">Return this file to the tagger so they can revise their tags.</p>
                  <button
                    onClick={() => { setIsSendingBack(true); setMessage(null); }}
                    className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Send Back to Tagger
                  </button>
                </div>
              )}

              {isSendingBack && (
                <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-amber-900 text-sm">Send Back for Revision</h3>
                  </div>
                  <label className="block text-xs font-medium text-amber-800 mb-1">
                    Notes for the tagger (optional)
                  </label>
                  <textarea
                    value={sendBackNotes}
                    onChange={(e) => setSendBackNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                    placeholder="Explain what needs to be revised..."
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSendBackToTagger}
                      disabled={submitting}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {submitting ? 'Sending...' : 'Confirm Send Back'}
                    </button>
                    <button
                      onClick={() => setIsSendingBack(false)}
                      disabled={submitting}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {file.status === 'NeedsRevision' && (
                <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-amber-900 text-sm">Sent Back for Revision</h3>
                  </div>
                  <p className="text-xs text-amber-700">This file has been sent back to the tagger for revision.</p>
                  {file.supervisorNotes && (
                    <p className="text-xs text-amber-800 mt-2 italic">"{file.supervisorNotes}"</p>
                  )}
                </div>
              )}

              {!isEditingTags && file.isCheckedBySupervisor && file.supervisorNotes && (
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

          <div className="flex items-center gap-2">
            {isEditingTags && (
              <>
                <button
                  onClick={() => setIsEditingTags(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedTags}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Tags'}
                </button>
              </>
            )}

            {!isEditingTags && !isSendingBack && !file.isCheckedBySupervisor && file.status !== 'NeedsRevision' && (
              <button
                onClick={handleMarkAsChecked}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? 'Marking as Reviewed...' : 'Mark as Reviewed'}
              </button>
            )}

            {!isEditingTags && !isSendingBack && file.isCheckedBySupervisor && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Already Reviewed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

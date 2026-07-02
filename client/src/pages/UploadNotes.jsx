import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, X } from 'lucide-react';
import { uploadNote } from '../api/notesApi';
import { getErrorMessage } from '../api/apiClient';

export default function UploadNotes() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFile = (selected) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.pdf$/i, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadNote(file, title, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      toast.success(data.message || 'Note uploaded successfully');
      navigate('/notes');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Upload notes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Upload a PDF of your study notes — StudyMate AI will read it and you can start
          summarizing, quizzing, or chatting with it right away.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary-soft' : 'border-line bg-paper-dim'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Drag and drop your PDF here, or click to browse
              </p>
              <p className="mt-1 text-xs text-ink-soft">PDF only, up to 10MB</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-paper-dim px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink-soft">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-md p-1.5 text-ink-soft hover:bg-white"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="e.g. Chapter 4 - Thermodynamics"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-paper-dim">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Uploading and processing... {progress}%</p>
          </div>
        )}

        <button type="submit" disabled={uploading || !file} className="btn-primary w-full py-2.5">
          {uploading ? 'Uploading...' : 'Upload note'}
        </button>
      </form>
    </div>
  );
}

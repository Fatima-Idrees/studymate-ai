import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Trash2, UploadCloud, MessageSquareText, Brain, AlertTriangle } from 'lucide-react';
import { getNotes, deleteNote } from '../api/notesApi';
import { getErrorMessage } from '../api/apiClient';
import { FullPageSpinner } from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const formatSize = (bytes) => {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

export default function NotesLibrary() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchNotes = async () => {
    try {
      const { data } = await getNotes();
      setNotes(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Notes library</h2>
          <p className="mt-1 text-sm text-ink-soft">All the PDFs you've uploaded so far.</p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <UploadCloud size={16} /> Upload
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes uploaded yet"
          description="Upload your first PDF to start summarizing, quizzing, and chatting with your notes."
          action={
            <Link to="/upload" className="btn-primary px-4 py-2 text-sm">
              Upload notes
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note._id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-ink" title={note.title}>
                    {note.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {formatSize(note.fileSize)} · {new Date(note.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!note.hasExtractedText && (
                <div className="mt-3 flex items-start gap-1.5 rounded-md bg-warning-soft px-2.5 py-1.5 text-xs text-warning">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  No readable text extracted — AI features may be limited for this file.
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/summary?noteId=${note._id}`}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <FileText size={13} /> Summarize
                </Link>
                <Link
                  to={`/chat?noteId=${note._id}`}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <MessageSquareText size={13} /> Chat
                </Link>
                <Link
                  to={`/quiz?noteId=${note._id}`}
                  className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                >
                  <Brain size={13} /> Quiz
                </Link>

                {confirmId === note._id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(note._id)}
                      disabled={deletingId === note._id}
                      className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      {deletingId === note._id ? 'Deleting...' : 'Confirm delete'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-dim"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(note._id)}
                    className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { getNotes } from '../api/notesApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

/**
 * Fetches the user's notes and renders a select dropdown.
 * Calls onChange(noteId) whenever the selection changes.
 */
export default function NoteSelect({ value, onChange, label = 'Select a note' }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await getNotes();
        if (isMounted) setNotes(data.data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <Spinner size={16} /> Loading your notes...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No notes uploaded yet"
        description="Upload a PDF first so the AI has something to work with."
      />
    );
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <select
        className="input-field"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Choose a note...
        </option>
        {notes.map((note) => (
          <option key={note._id} value={note._id}>
            {note.title}
          </option>
        ))}
      </select>
    </div>
  );
}

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Printer } from 'lucide-react';
import NoteSelect from '../components/NoteSelect';
import AIContentBlock from '../components/AIContentBlock';
import { generateRevisionNotes } from '../api/aiApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from '../components/Spinner';

export default function RevisionNotes() {
  const [noteId, setNoteId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [revisionText, setRevisionText] = useState('');

  const handleGenerate = async () => {
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    setGenerating(true);
    setRevisionText('');
    try {
      const { data } = await generateRevisionNotes(noteId);
      setRevisionText(data.data.revisionNotes);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Revision notes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          A 1-page, last-minute revision sheet with key concepts, formulas, and definitions.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <NoteSelect value={noteId} onChange={setNoteId} label="Generate revision sheet from" />
        <button
          onClick={handleGenerate}
          disabled={generating || !noteId}
          className="btn-primary flex w-full items-center justify-center gap-2 py-2.5"
        >
          {generating ? (
            <>
              <Spinner size={16} /> Generating revision sheet...
            </>
          ) : (
            <>
              <FileText size={16} /> Generate revision sheet
            </>
          )}
        </button>
      </div>

      {revisionText && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Printer size={13} /> Print
            </button>
          </div>
          <AIContentBlock markdown={revisionText} label="Revision Sheet" />
        </div>
      )}
    </div>
  );
}

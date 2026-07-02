import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
import NoteSelect from '../components/NoteSelect';
import AIContentBlock from '../components/AIContentBlock';
import { generateSummary } from '../api/aiApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from '../components/Spinner';

const SUMMARY_TYPES = [
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'bullets', label: 'Bullet Points' },
];

export default function Summary() {
  const [searchParams] = useSearchParams();
  const [noteId, setNoteId] = useState(searchParams.get('noteId') || '');
  const [summaryType, setSummaryType] = useState('concise');
  const [generating, setGenerating] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const handleGenerate = async () => {
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    setGenerating(true);
    setSummaryText('');
    try {
      const { data } = await generateSummary(noteId, summaryType);
      setSummaryText(data.data.summary);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Summary generator</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Turn your notes into a concise, detailed, or bullet-point summary.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <NoteSelect value={noteId} onChange={setNoteId} label="Summarize" />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Summary style</label>
          <div className="flex gap-2">
            {SUMMARY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSummaryType(t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  summaryType === t.value
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-ink-soft hover:bg-paper-dim'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !noteId}
          className="btn-primary flex w-full items-center justify-center gap-2 py-2.5"
        >
          {generating ? (
            <>
              <Spinner size={16} /> Generating summary...
            </>
          ) : (
            <>
              <FileText size={16} /> Generate summary
            </>
          )}
        </button>
      </div>

      {summaryText && <AIContentBlock markdown={summaryText} label={`${summaryType} summary`} />}
    </div>
  );
}

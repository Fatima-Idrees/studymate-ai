import { useState } from 'react';
import toast from 'react-hot-toast';
import { Layers, ChevronLeft, ChevronRight, Sparkles, RotateCw } from 'lucide-react';
import NoteSelect from '../components/NoteSelect';
import { generateFlashcards } from '../api/aiApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from '../components/Spinner';

export default function Flashcards() {
  const [noteId, setNoteId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleGenerate = async () => {
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    setGenerating(true);
    setCards(null);
    setIndex(0);
    setFlipped(false);
    try {
      const { data } = await generateFlashcards(noteId);
      if (!data.data.flashcards.length) {
        toast.error('No flashcards could be generated from this note');
      } else {
        setCards(data.data.flashcards);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const goTo = (newIndex) => {
    setFlipped(false);
    setIndex(newIndex);
  };

  const card = cards?.[index];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Flashcards</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Quiz yourself with question-and-answer flashcards generated from your notes.
        </p>
      </div>

      {!cards && (
        <div className="card space-y-4 p-6">
          <NoteSelect value={noteId} onChange={setNoteId} label="Generate flashcards from" />
          <button
            onClick={handleGenerate}
            disabled={generating || !noteId}
            className="btn-primary flex w-full items-center justify-center gap-2 py-2.5"
          >
            {generating ? (
              <>
                <Spinner size={16} /> Generating flashcards...
              </>
            ) : (
              <>
                <Layers size={16} /> Generate flashcards
              </>
            )}
          </button>
        </div>
      )}

      {cards && card && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-ink-soft">
            <span>
              Card {index + 1} of {cards.length}
            </span>
            <button
              onClick={() => setCards(null)}
              className="font-medium text-primary hover:underline"
            >
              Generate new set
            </button>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            className="ai-block flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center transition-transform"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFlipped((f) => !f)}
          >
            <span className="ai-tag">
              <Sparkles size={11} /> {flipped ? 'Answer' : 'Question'} · {card.topic}
            </span>
            <p className="text-lg font-medium leading-relaxed text-ink">
              {flipped ? card.back : card.front}
            </p>
            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
              <RotateCw size={12} /> Click to flip
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => goTo(Math.max(0, index - 1))}
              disabled={index === 0}
              className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => goTo(Math.min(cards.length - 1, index + 1))}
              disabled={index === cards.length - 1}
              className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

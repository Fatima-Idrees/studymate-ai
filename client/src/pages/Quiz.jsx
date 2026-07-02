import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Brain, Sparkles, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import NoteSelect from '../components/NoteSelect';
import { generateQuiz, submitQuiz } from '../api/aiApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from '../components/Spinner';

const TYPE_LABEL = { mcq: 'Multiple Choice', short: 'Short Answer', long: 'Long Answer' };

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const [noteId, setNoteId] = useState(searchParams.get('noteId') || '');
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> answer string
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    setGenerating(true);
    setQuiz(null);
    setResult(null);
    setAnswers({});
    try {
      const { data } = await generateQuiz(noteId);
      setQuiz(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q) => !answers[q._id]?.trim());
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q._id,
        userAnswer: answers[q._id],
      }));
      const { data } = await submitQuiz(quiz._id, payload);
      setResult(data.data);
      toast.success('Quiz submitted!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setQuiz(null);
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">Quiz generator</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Generate MCQs, short, and long questions straight from your notes.
        </p>
      </div>

      {!quiz && (
        <div className="card space-y-4 p-6">
          <NoteSelect value={noteId} onChange={setNoteId} label="Generate a quiz from" />
          <button
            onClick={handleGenerate}
            disabled={generating || !noteId}
            className="btn-primary flex w-full items-center justify-center gap-2 py-2.5"
          >
            {generating ? (
              <>
                <Spinner size={16} /> Generating questions...
              </>
            ) : (
              <>
                <Brain size={16} /> Generate quiz
              </>
            )}
          </button>
        </div>
      )}

      {quiz && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">{quiz.title}</h3>
            <span className="text-xs text-ink-soft">{quiz.questions.length} questions</span>
          </div>

          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="ai-tag">
                  <Sparkles size={11} /> {TYPE_LABEL[q.type]}
                </span>
                <span className="text-xs text-ink-soft">· {q.topic}</span>
              </div>
              <p className="mb-3 text-sm font-medium text-ink">
                {idx + 1}. {q.question}
              </p>

              {q.type === 'mcq' ? (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        answers[q._id] === opt
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-line hover:bg-paper-dim'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={() => handleAnswerChange(q._id, opt)}
                        className="accent-[var(--color-primary)]"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Write your answer..."
                  value={answers[q._id] || ''}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? 'Submitting...' : 'Submit quiz'}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <p className="font-mono text-4xl font-bold text-primary">{result.score ?? '—'}%</p>
            <p className="text-sm text-ink-soft">Your score on auto-graded questions</p>
            <button
              onClick={resetAll}
              className="btn-secondary mt-3 flex items-center gap-2 px-4 py-2 text-sm"
            >
              <RotateCcw size={14} /> Take another quiz
            </button>
          </div>

          {result.quiz.questions.map((q, idx) => (
            <div key={q._id} className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="ai-tag">
                  <Sparkles size={11} /> {TYPE_LABEL[q.type]}
                </span>
                {q.isCorrect !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      q.isCorrect ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              <p className="mb-2 text-sm font-medium text-ink">
                {idx + 1}. {q.question}
              </p>
              <p className="text-sm text-ink-soft">
                Your answer: <span className="text-ink">{q.userAnswer}</span>
              </p>
              {q.correctAnswer && (
                <p className="mt-1 text-sm text-ink-soft">
                  {q.type === 'mcq' ? 'Correct answer' : 'Model answer'}:{' '}
                  <span className="text-ink">{q.correctAnswer}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

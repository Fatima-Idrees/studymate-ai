import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Sparkles, MessageSquareText } from 'lucide-react';
import NoteSelect from '../components/NoteSelect';
import { chatWithNotes } from '../api/aiApi';
import { getErrorMessage } from '../api/apiClient';
import Spinner from '../components/Spinner';

export default function ChatWithNotes() {
  const [searchParams] = useSearchParams();
  const [noteId, setNoteId] = useState(searchParams.get('noteId') || '');
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', content }
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!noteId) {
      toast.error('Select a note first');
      return;
    }
    if (!question.trim()) return;

    const userMessage = { role: 'user', content: question.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion('');
    setSending(true);

    try {
      const { data } = await chatWithNotes(
        noteId,
        userMessage.content,
        nextMessages.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.answer }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => prev.slice(0, -1)); // roll back the user message bubble context but keep it visible
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink">Chat with your notes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ask anything — answers come strictly from the note you select below.
        </p>
      </div>

      <div className="mb-4">
        <NoteSelect value={noteId} onChange={setNoteId} label="Note to chat with" />
      </div>

      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ink-soft">
              <MessageSquareText size={28} />
              <p className="text-sm">Ask a question about your notes to get started.</p>
            </div>
          ) : (
            messages.map((m, idx) =>
              m.role === 'user' ? (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex justify-start">
                  <div className="ai-block max-w-[85%] rounded-tl-sm">
                    <span className="ai-tag mb-1.5 block">
                      <Sparkles size={11} /> StudyMate AI
                    </span>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                      {m.content}
                    </p>
                  </div>
                </div>
              )
            )
          )}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Spinner size={14} /> Thinking...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Ask a question about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={sending || !noteId}
          />
          <button
            type="submit"
            disabled={sending || !noteId || !question.trim()}
            className="btn-primary flex h-10 w-10 shrink-0 items-center justify-center"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

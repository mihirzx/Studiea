import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { chat, getChatHistory, getActivePlan } from '../../api/studyPlans.js';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ChatBubble from '../../components/ChatBubble.jsx';

function StudyBuddy() {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [plan, setPlan] = useState(null);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanExpanded, setIsPlanExpanded] = useState(true);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [history, activePlan] = await Promise.all([
          getChatHistory(user.id).catch(() => []),
          getActivePlan(user.id).catch(() => null),
        ]);
        if (cancelled) return;
        setMessages(Array.isArray(history) ? history : []);
        setPlan(activePlan);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.id]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;

    setSendError('');
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await chat(text);
      const reply = res?.message || res?.response || res?.content || "Sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setSendError("Hmm, something went wrong — try again!");
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen flex-col bg-purple-50">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <PageHeader title="Study Buddy 🤖" variant="student" />

        {/* Study plan context panel */}
        {plan?.daily_goal && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50">
            <button
              onClick={() => setIsPlanExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-amber-800"
            >
              <span>Today's Study Goal</span>
              <span>{isPlanExpanded ? '↑ Hide' : '↓ Show'}</span>
            </button>
            {isPlanExpanded && (
              <div className="border-t border-amber-100 px-4 pb-4 pt-3">
                <p className="text-sm text-slate-700">{plan.daily_goal}</p>
                {plan.weak_areas?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {plan.weak_areas.map((area) => (
                      <span key={area} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat window */}
        <div className="flex flex-1 flex-col rounded-2xl border border-purple-100 bg-white shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[300px] max-h-[55vh]">
            {messages.length === 0 ? (
              <EmptyState
                icon="💬"
                title="Your Study Buddy is ready!"
                description="Ask me anything about your STEM topics — I'm here to help you understand, not just give answers."
              />
            ) : (
              messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} content={m.content} />
              ))
            )}
            {isSending && (
              <div className="flex justify-start my-1">
                <div className="rounded-2xl bg-gray-200 px-4 py-2 text-sm text-gray-500 italic">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-purple-100 p-3">
            {sendError && (
              <p className="mb-2 text-xs text-red-500 text-center">{sendError}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-purple-200 p-3 text-sm text-slate-800 placeholder-gray-400 focus:border-student-500 focus:outline-none"
                placeholder="Ask your Study Buddy…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="shrink-0 rounded-xl bg-student-500 px-4 py-3 text-sm font-bold text-white hover:bg-student-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-1.5 text-center text-xs text-gray-400">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyBuddy;

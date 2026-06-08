// Single Study Buddy chat message. role = 'user' | 'assistant'.
export default function ChatBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-1`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900 dark:bg-slate-800 dark:text-slate-100'
      }`}>
        {content}
      </div>
    </div>
  );
}

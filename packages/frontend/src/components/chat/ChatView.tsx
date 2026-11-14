// ============================================================
// Aary's IDE — Chat View
// Central agent communication, voice input, tool execution logs
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Terminal, Bot, User, Sparkles } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore.js';
import { Button, Badge } from '../ui/index.js';

export const ChatView: React.FC = () => {
  const { messages, sendMessage, loading, state } = useAgentStore();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    sendMessage(text);
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => `${prev} ${transcript}`.trim());
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4 py-4">
      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">How can Aary help you today?</h2>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
              Delegate tasks, build applications, run commands, research with browsers, or continue work from WhatsApp.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md text-left">
              {[
                'Build a full-stack dashboard with auth',
                'Create a GitHub repo and push this workspace',
                'Research competitors and generate a report',
                'Inspect screen and automate browser workflow',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            const isTool = m.role === 'tool';

            if (isTool) {
              return (
                <div key={m.id} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tool Output</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-slate-700 dark:text-slate-300">{m.content}</pre>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono py-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="capitalize">Agent is {state}...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSubmit} className="mt-3 relative">
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type an outcome or task for the agent..."
            className="flex-1 bg-transparent border-none px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
          />

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-1.5 rounded-lg transition-colors mr-1 ${
              isRecording ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Voice input (STT)"
          >
            <Mic className="w-4 h-4" />
          </button>

          <Button type="submit" size="sm" disabled={!input.trim() || loading} className="rounded-xl px-3 py-1.5">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

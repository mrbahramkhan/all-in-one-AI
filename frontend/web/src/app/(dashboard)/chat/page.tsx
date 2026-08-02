'use client';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { chatApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', color: '#10a37f' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', color: '#10a37f' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet', color: '#d4a574' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku', color: '#d4a574' },
  { id: 'gemini-2.0-flash', label: 'Gemini Flash', color: '#4285f4' },
];

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    streamingContent,
    isStreaming,
    selectedModels,
    chatMode,
    setConversations,
    addConversation,
    setActiveConversation,
    setMessages,
    addMessage,
    appendStreamChunk,
    setStreaming,
    clearStream,
    setSelectedModels,
    setChatMode,
  } = useChatStore();

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const activeMessages = messages[activeConversationId ?? ''] ?? [];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, streamingContent]);

  const loadConversations = async () => {
    try {
      const { data } = await chatApi.getConversations();
      setConversations(data.data);
    } catch {}
  };

  const selectConversation = async (id: string) => {
    setActiveConversation(id);
    try {
      const { data } = await chatApi.getMessages(id);
      setMessages(id, data.data);
    } catch {}
  };

  const newConversation = async () => {
    try {
      const { data } = await chatApi.createConversation({
        title: 'New Chat',
        model: selectedModels[0],
        mode: chatMode,
      });
      addConversation(data.data);
      setActiveConversation(data.data.id);
      setMessages(data.data.id, []);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      try {
        const { data } = await chatApi.createConversation({
          title: input.slice(0, 60),
          model: selectedModels[0],
        });
        addConversation(data.data);
        convId = data.data.id;
        setActiveConversation(convId);
        setMessages(convId, []);
      } catch {
        return;
      }
    }

    const userMsg = {
      id: crypto.randomUUID(),
      conversationId: convId!,
      role: 'user' as const,
      content: input,
      createdAt: new Date(),
    };
    addMessage(convId!, userMsg);

    const prompt = input;
    setInput('');
    clearStream();
    setStreaming(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_URL + '/api/v1/ai/complete/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          model: selectedModels[0],
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) appendStreamChunk(parsed.delta);
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
    }

    setStreaming(false);
    clearStream();
  };

  return (
    <div className="flex h-full">
      <div className="w-60 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <button
            onClick={newConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={
                'w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ' +
                (conv.id === activeConversationId
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50')
              }
            >
              {conv.title}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">No conversations yet</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-2 flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['single', 'compare', 'router'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setChatMode(mode)}
                className={
                  'px-3 py-1.5 text-xs font-medium transition-colors ' +
                  (chatMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground')
                }
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModels([model.id])}
                className={
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ' +
                  (selectedModels.includes(model.id)
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-border text-muted-foreground')
                }
              >
                {model.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {activeMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={
                    `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ` +
                    (msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white')
                  }
                >
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div
                  className={
                    `max-w-[80%] px-4 py-3 rounded-2xl text-sm ` +
                    (msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-border rounded-tl-sm')
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isStreaming && streamingContent && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs text-white font-bold shrink-0">
                  AI
                </div>
                <div className="flex-1 bg-card rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-border">
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5" />
                </div>
              </div>
            )}

            {activeMessages.length === 0 && !isStreaming && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">Chat</div>
                <h3 className="font-semibold mb-2">Start a conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Ask anything. Pick a model above and start chatting.
                </p>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto flex gap-2 items-end rounded-xl border border-border bg-card overflow-hidden px-3 py-2 focus-within:ring-1 focus-within:ring-violet-500">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Ask ${MODELS.find((m) => m.id === selectedModels[0])?.label ?? 'AI'}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground py-1"
              style={{ minHeight: '1.5rem' }}
            />
            <button
              onClick={sendMessage}
              disabled={isStreaming || !input.trim()}
              className="shrink-0 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center transition-colors text-white"
            >
              {isStreaming ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '→'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

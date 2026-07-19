'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { chatApi, aiApi } from '@/lib/api';
import { cn, formatCost } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, ChatMode } from '@ai-os/types';

const MODELS = [
  { id: 'gpt-4o',             label: 'GPT-4o',          provider: 'openai',    color: '#10a37f' },
  { id: 'gpt-4o-mini',        label: 'GPT-4o Mini',     provider: 'openai',    color: '#10a37f' },
  { id: 'claude-sonnet-4-6',  label: 'Claude Sonnet',   provider: 'anthropic', color: '#d4a574' },
  { id: 'claude-haiku-4-5',   label: 'Claude Haiku',    provider: 'anthropic', color: '#d4a574' },
  { id: 'gemini-2.0-flash',   label: 'Gemini Flash',    provider: 'google',    color: '#4285f4' },
  { id: 'gemini-1.5-pro',     label: 'Gemini Pro',      provider: 'google',    color: '#4285f4' },
  { id: 'grok-2-1212',        label: 'Grok 2',          provider: 'xai',       color: '#888' },
  { id: 'deepseek-chat',      label: 'DeepSeek V3',     provider: 'deepseek',  color: '#00aaff' },
];

const MODES: { id: ChatMode; label: string }[] = [
  { id: 'single',    label: 'Single' },
  { id: 'compare',   label: 'Compare' },
  { id: 'battle',    label: 'Battle' },
  { id: 'consensus', label: 'Consensus' },
  { id: 'router',    label: 'Auto Router' },
];

export default function ChatPage() {
  const {
    conversations, activeConversationId, messages, streamingContent,
    isStreaming, selectedModels, chatMode,
    setConversations, addConversation, setActiveConversation,
    setMessages, addMessage, appendStreamChunk, setStreaming, clearStream,
    setSelectedModels, setChatMode,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [compareResponses, setCompareResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const activeMessages = messages[activeConversationId ?? ''] ?? [];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, streamingContent]);

  const loadConversations = async () => {
    try {
      const { data } = await chatApi.getConversations();
      setConversations(data.data);
      if (data.data.length > 0 && !activeConversationId) {
        await selectConversation(data.data[0].id);
      }
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
      const { data } = await chatApi.createConversation({ title: input.slice(0, 60), model: selectedModels[0], mode: chatMode });
      addConversation(data.data);
      convId = data.data.id;
      setActiveConversation(convId);
      setMessages(convId, []);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(), conversationId: convId!, role: 'user',
      content: input, createdAt: new Date(),
    };
    addMessage(convId!, userMsg);
    const prompt = input;
    setInput('');
    clearStream();

    if (chatMode === 'compare') {
      // Parallel compare
      const newCompare: Record<string, string> = {};
      selectedModels.forEach(m => (newCompare[m] = ''));
      setCompareResponses(newCompare);
      setStreaming(true);
      await Promise.all(selectedModels.map(async (model) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/complete/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: true }),
          });
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            const lines = text.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  setCompareResponses(prev => ({ ...prev, [model]: (prev[model] ?? '') + parsed.delta }));
                }
              } catch {}
            }
          }
        } catch {}
      }));
      setStreaming(false);
    } else {
      // Single streaming
      setStreaming(true);
      const model = chatMode === 'router' ? undefined : selectedModels[0];
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/complete/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: true, mode: chatMode }),
        });
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const d = line.slice(6);
            if (d === '[DONE]') break;
            try {
              const parsed = JSON.parse(d);
              if (parsed.delta) appendStreamChunk(parsed.delta);
            } catch {}
          }
        }
        const aiMsg: Message = {
          id: crypto.randomUUID(), conversationId: convId!, role: 'assistant',
          content: streamingContent, model: model ?? 'auto', createdAt: new Date(),
        };
        addMessage(convId!, aiMsg);
      } catch {}
      setStreaming(false);
      clearStream();
    }
  };

  const toggleModel = (modelId: string) => {
    if (chatMode === 'single' || chatMode === 'router') {
      setSelectedModels([modelId]);
    } else {
      setSelectedModels(
        selectedModels.includes(modelId)
          ? selectedModels.filter(m => m !== modelId)
          : [...selectedModels, modelId].slice(0, 4)
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="w-60 border-r border-border flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <button onClick={newConversation} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <span>+</span> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => selectConversation(conv.id)}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors',
                conv.id === activeConversationId ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}>
              💬 {conv.title}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border px-4 py-2 flex items-center gap-3 flex-wrap">
          {/* Mode selector */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setChatMode(m.id)}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors',
                  chatMode === m.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {m.label}
              </button>
            ))}
          </div>
          {/* Model selector */}
          <div className="flex flex-wrap gap-1.5">
            {MODELS.slice(0, 6).map(m => (
              <button key={m.id} onClick={() => toggleModel(m.id)}
                className={cn('px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  selectedModels.includes(m.id)
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-border text-muted-foreground hover:border-violet-500/50'
                )}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {chatMode === 'compare' ? (
            /* Compare grid */
            <div className="p-4 space-y-4">
              {activeMessages.filter(m => m.role === 'user').map(userMsg => (
                <div key={userMsg.id}>
                  <div className="flex justify-end mb-3">
                    <div className="max-w-lg bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
                      {userMsg.content}
                    </div>
                  </div>
                  <div className={cn('grid gap-4', selectedModels.length === 1 ? 'grid-cols-1' : selectedModels.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                    {selectedModels.map(modelId => {
                      const model = MODELS.find(m => m.id === modelId);
                      const content = compareResponses[modelId] ?? '';
                      return (
                        <div key={modelId} className="rounded-xl border border-border bg-card overflow-hidden">
                          <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: model?.color }} />
                            <span className="text-xs font-medium">{model?.label}</span>
                          </div>
                          <div className="p-3 text-sm prose-chat min-h-[80px]">
                            {content ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                              : isStreaming ? <span className="text-muted-foreground animate-pulse">Generating...</span>
                              : <span className="text-muted-foreground">Waiting...</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Single chat */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {activeMessages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {/* Streaming */}
              {isStreaming && streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs text-white font-bold shrink-0">AI</div>
                  <div className="flex-1 bg-card rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-border">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5" />
                  </div>
                </div>
              )}
              {isStreaming && !streamingContent && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs text-white font-bold shrink-0">AI</div>
                  <div className="flex items-center gap-1 px-4 py-3">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {activeMessages.length === 0 && !isStreaming && (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground text-sm">Ask anything. Compare models. Build workflows.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end rounded-xl border border-border bg-card overflow-hidden px-3 py-2 focus-within:ring-1 focus-within:ring-violet-500">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${chatMode === 'compare' ? `${selectedModels.length} models` : chatMode === 'router' ? 'and I\'ll pick the best model' : MODELS.find(m => m.id === selectedModels[0])?.label ?? 'AI'}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-32 py-1"
                style={{ minHeight: '1.5rem' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = `${t.scrollHeight}px`;
                }}
              />
              <button onClick={sendMessage} disabled={isStreaming || !input.trim()}
                className="shrink-0 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center transition-colors text-white">
                {isStreaming
                  ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                }
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex gap-3 text-xs text-muted-foreground">
                <button className="hover:text-foreground transition-colors">📎 File</button>
                <button className="hover:text-foreground transition-colors">🖼 Image</button>
                <button className="hover:text-foreground transition-colors">🎤 Voice</button>
              </div>
              <span className="text-xs text-muted-foreground">⏎ Send · ⇧⏎ Newline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const model = MODELS.find(m => m.id === message.model);

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
      )}>
        {isUser ? 'U' : 'AI'}
      </div>
      {/* Bubble */}
      <div className={cn('max-w-[80%]', isUser && 'items-end flex flex-col')}>
        {!isUser && model && (
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
            {model.label}
            {message.costUsd && <span className="text-xs">· {formatCost(message.costUsd)}</span>}
            {message.latencyMs && <span className="text-xs">· {message.latencyMs}ms</span>}
          </div>
        )}
        <div className={cn('rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-card border border-border rounded-tl-sm prose-chat'
        )}>
          {isUser
            ? message.content
            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          }
        </div>
        {/* Actions */}
        {!isUser && (
          <div className="flex gap-2 mt-1 px-1">
            {['👍', '👎', '📋'].map(icon => (
              <button key={icon} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{icon}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

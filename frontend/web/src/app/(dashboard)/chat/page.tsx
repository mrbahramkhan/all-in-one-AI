'use client';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { chatApi } from '@/lib/api';

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
      const response = await chatApi.getConversations();
      setConversations(response.data?.data ?? []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleNewChat = () => {
    addConversation();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId) return;

    addMessage(activeConversationId, {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    });

    setInput('');
    setStreaming(true);

    try {
      const response = await fetch('/api/proxy/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: input,
          models: selectedModels,
          mode: chatMode,
        }),
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        appendStreamChunk(activeConversationId, text);
      }

      clearStream(activeConversationId);
    } catch (error) {
      console.error('Chat error:', error);
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r border-border bg-card p-4">
        <button
          onClick={handleNewChat}
          className="w-full mb-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium"
        >
          New Chat
        </button>

        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeConversationId === conv.id
                  ? 'bg-violet-600 text-white'
                  : 'hover:bg-accent'
              }`}
            >
              {conv.title || 'New Chat'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {activeMessages.length === 0 && !streamingContent[activeConversationId ?? ''] ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a chat or start a new conversation</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-card border border-border'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {streamingContent[activeConversationId ?? ''] && (
                <div className="flex justify-start">
                  <div className="max-w-md px-4 py-2 rounded-lg bg-card border border-border">
                    {streamingContent[activeConversationId ?? '']}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-6">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isStreaming || !activeConversationId}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || !activeConversationId || !input.trim()}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-sm font-medium"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { create } from 'zustand';
import type { Conversation, Message, ChatMode } from '@ai-os/types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  streamingContent: string;
  isStreaming: boolean;
  selectedModels: string[];
  chatMode: ChatMode;
  setConversations: (convs: Conversation[]) => void;
  addConversation: (conv: Conversation) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (convId: string, messages: Message[]) => void;
  addMessage: (convId: string, message: Message) => void;
  appendStreamChunk: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearStream: () => void;
  setSelectedModels: (models: string[]) => void;
  setChatMode: (mode: ChatMode) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  streamingContent: '',
  isStreaming: false,
  selectedModels: ['gpt-4o'],
  chatMode: 'single',
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conv) => set((s) => ({ conversations: [conv, ...s.conversations] })),
  setActiveConversation: (id) => set({ activeConversationId: id, streamingContent: '' }),
  setMessages: (convId, messages) => set((s) => ({ messages: { ...s.messages, [convId]: messages } })),
  addMessage: (convId, message) => set((s) => ({
    messages: { ...s.messages, [convId]: [...(s.messages[convId] ?? []), message] }
  })),
  appendStreamChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearStream: () => set({ streamingContent: '' }),
  setSelectedModels: (selectedModels) => set({ selectedModels }),
  setChatMode: (chatMode) => set({ chatMode }),
}));

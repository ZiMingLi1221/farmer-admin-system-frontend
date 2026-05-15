import { computed, type Ref, ref } from 'vue';

import { useChatStore } from '@/stores/chat';
import type { Message } from '@/types/chat';
import type { DocumentReference } from '@/types/rag';

/**
 * useChat Composable 配置選項
 */
export interface UseChatOptions {
  conversationId?: string;
  enableRAG?: boolean;
}

/**
 * useChat Composable 返回值
 */
export interface UseChatReturn {
  messages: Ref<Message[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;

  sendMessage: (content: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  toggleFeedback: (messageId: string, kind: 'good' | 'bad') => void;

  // 文件引用顯示開關（個別訊息可獨立控制，這裡是全域預設）
  references: Ref<DocumentReference[]>;
  showReferences: Ref<boolean>;
  toggleReferences: () => void;
}

/**
 * useChat Composable
 * 處理單個對話的交互邏輯
 */
export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const chatStore = useChatStore();

  const conversationId = ref(options.conversationId);
  const enableRAG = ref(options.enableRAG ?? true);

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const references = ref<DocumentReference[]>([]);
  const showReferences = ref(true);

  const messages = computed<Message[]>(() => {
    if (!conversationId.value) return [];
    const conversation = chatStore.conversations.find((c) => c.id === conversationId.value);
    return conversation?.messages ?? [];
  });

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;
    try {
      isLoading.value = true;
      error.value = null;
      const newId = await chatStore.sendMessage(
        conversationId.value,
        content,
        undefined,
        enableRAG.value
      );
      if (!conversationId.value) {
        conversationId.value = newId;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '發送消息失敗';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const copyMessage = async (messageId: string): Promise<void> => {
    const conversation = chatStore.conversations.find((c) => c.id === conversationId.value);
    if (!conversation) return;
    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message) return;
    await navigator.clipboard.writeText(message.content);
  };

  /**
   * 本地 toggle 訊息評價：同樣 kind 再點一次取消，否則切換
   * 不會打 API，僅供 UI 反饋
   */
  const toggleFeedback = (messageId: string, kind: 'good' | 'bad'): void => {
    const conversation = chatStore.conversations.find((c) => c.id === conversationId.value);
    if (!conversation) return;
    const message = conversation.messages.find((m) => m.id === messageId);
    if (!message) return;
    message.feedback = message.feedback === kind ? undefined : kind;
  };

  const toggleReferences = (): void => {
    showReferences.value = !showReferences.value;
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    copyMessage,
    toggleFeedback,
    references,
    showReferences,
    toggleReferences,
  };
};

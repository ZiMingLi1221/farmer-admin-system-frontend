import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getConversations, sendMessage as sendMessageApi } from '@/api/chat';
import { CHAT } from '@/config';
import type { Conversation, Message } from '@/types';

export const useChatStore = defineStore(
  'chat',
  () => {
    const conversations = ref<Conversation[]>([]);
    const currentConversationId = ref<string | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string | null>(null);

    /**
     * 創建新對話（本地）
     */
    const createConversation = (): Conversation => {
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        title: '新對話',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversations.value.unshift(newConversation);
      currentConversationId.value = newConversation.id;
      return newConversation;
    };

    /**
     * 設置當前對話
     */
    const setCurrentConversation = (conversationId: string | null): void => {
      currentConversationId.value = conversationId;
    };

    /**
     * 刪除對話
     */
    const deleteConversation = async (conversationId: string): Promise<void> => {
      try {
        // httpClient.delete(`/chat/conversations/${conversationId}`)
        // 本地刪除
        const index = conversations.value.findIndex((c) => c.id === conversationId);
        if (index !== -1) {
          conversations.value.splice(index, 1);
        }

        // 如果刪除的是當前對話，清除當前對話 ID
        if (currentConversationId.value === conversationId) {
          currentConversationId.value = null;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : '刪除對話失敗';
        throw err;
      }
    };

    /**
     * 發送訊息（樂觀更新）
     */
    const sendMessage = async (
      conversationId: string | undefined,
      content: string,
      attachments?: import('@/types').UploadedFile[],
      useRAG = true
    ): Promise<string> => {
      let targetConversationId = conversationId;

      try {
        // 1. 立即創建或獲取對話
        if (!targetConversationId) {
          const newConv = createConversation();
          targetConversationId = newConv.id;
        }

        const conversation = conversations.value.find((c) => c.id === targetConversationId);
        if (!conversation) throw new Error('對話不存在');

        // 2. 立即添加用戶訊息（樂觀更新）
        const userMessage: Message = {
          id: `msg_${Date.now()}`,
          content,
          role: 'user',
          timestamp: new Date(),
          attachments, // 添加附件
        };

        conversation.messages.push(userMessage);

        // 3. 如果是第一條訊息，立即更新標題
        if (conversation.messages.length === 1) {
          conversation.title =
            content.slice(0, CHAT.MAX_CONVERSATION_TITLE_LENGTH) +
            (content.length > CHAT.MAX_CONVERSATION_TITLE_LENGTH ? '...' : '');
        }

        conversation.updatedAt = new Date();

        // 4. 背景處理 AI 回覆
        handleAIResponse(targetConversationId, content, useRAG);

        return targetConversationId;
      } catch (err) {
        error.value = err instanceof Error ? err.message : '發送訊息失敗';
        throw err;
      }
    };

    /**
     * 背景處理 AI 回覆
     *
     * 後端 SSE 串流尚未上線（domain.md 標註規畫中），先在前端模擬串流：
     * 拿到完整回覆後，將內容逐段填入 message.content 並維持 isStreaming = true，
     * 直到全部寫完才設為 false。未來接 SSE 只需改成從 stream chunk 寫入 content。
     */
    const handleAIResponse = async (
      conversationId: string,
      userMessage: string,
      useRAG: boolean
    ): Promise<void> => {
      const STREAM_CHUNK_SIZE = 2;
      const STREAM_INTERVAL_MS = 20;

      try {
        isLoading.value = true;
        error.value = null;

        const conversation = conversations.value.find((c) => c.id === conversationId);
        if (!conversation) return;

        const res = await sendMessageApi({
          conversationId,
          query: userMessage,
          useRAG,
        });

        const aiMessage = res.data.message;
        const fullContent = aiMessage.content;

        const placeholder: Message = {
          ...aiMessage,
          content: '',
          timestamp: new Date(aiMessage.timestamp),
          isStreaming: true,
        };
        conversation.messages.push(placeholder);
        conversation.updatedAt = new Date();

        // 取消 loading（typing indicator 隱藏，改由 isStreaming 在 message 上呈現游標）
        isLoading.value = false;

        await new Promise<void>((resolve) => {
          let cursor = 0;
          const target = conversation.messages[conversation.messages.length - 1];
          const timer = setInterval(() => {
            cursor += STREAM_CHUNK_SIZE;
            if (cursor >= fullContent.length) {
              target.content = fullContent;
              target.isStreaming = false;
              clearInterval(timer);
              resolve();
              return;
            }
            target.content = fullContent.slice(0, cursor);
          }, STREAM_INTERVAL_MS);
        });
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'AI 回覆失敗';
        isLoading.value = false;
      }
    };

    /**
     * 載入對話列表（從後端）
     */
    const loadConversations = async (): Promise<void> => {
      try {
        isLoading.value = true;
        error.value = null;

        const res = await getConversations();
        conversations.value = res.data.items.map((conv) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: (conv.messages || []).map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      } catch (err) {
        error.value = err instanceof Error ? err.message : '載入對話列表失敗';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      conversations,
      currentConversationId,
      isLoading,
      error,
      createConversation,
      setCurrentConversation,
      deleteConversation,
      sendMessage,
      loadConversations,
    };
  },
  {
    persist: {
      key: 'chat-state',
      pick: ['conversations'],
    },
  }
);

/**
 * Chat API
 * 對話與訊息相關的 HTTP 端點封裝
 */

import type { ApiResponse } from '@/types/api';
import type { Conversation, Message } from '@/types/chat';
import { httpClient } from '@/utils/request';

export interface SendMessageRequest {
  conversationId: string;
  query: string;
  useRAG: boolean;
}

export interface SendMessageResponse {
  conversationId: string;
  message: Message;
}

export interface GetConversationsResponse {
  items: Conversation[];
}

/**
 * 發送訊息並取得 AI 回覆
 */
export const sendMessage = async (
  request: SendMessageRequest
): Promise<ApiResponse<SendMessageResponse>> => {
  return httpClient.post<SendMessageResponse>('/chat/message', request);
};

/**
 * 取得對話列表
 */
export const getConversations = async (): Promise<ApiResponse<GetConversationsResponse>> => {
  return httpClient.get<GetConversationsResponse>('/chat/conversations');
};

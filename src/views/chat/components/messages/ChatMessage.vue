<template>
  <div
    :class="['message-wrapper', isUser ? 'message-wrapper-user' : 'message-wrapper-assistant']"
    tabindex="-1"
  >
    <!-- AI 頭像 -->
    <div v-if="!isUser" class="message-avatar">
      <LeafIcon class="avatar-leaf" />
    </div>

    <!-- 訊息主體 -->
    <div class="message-body">
      <div v-if="isUser" class="bubble-user">
        {{ message.content }}
      </div>

      <div v-else class="message-assistant-content">
        <div
          class="message-markdown"
          :class="{ 'is-streaming': isStreaming }"
          v-html="formattedContent"
        />
        <SourceReference
          v-if="message.references && message.references.length > 0"
          :references="message.references"
        />
      </div>

      <MessageActions
        v-if="!isStreaming && message.content"
        :feedback="message.feedback"
        :user-only="isUser"
        @copy="handleCopy"
        @feedback="handleFeedback"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LeafIcon from '@/components/icons/LeafIcon.vue';
import type { Message } from '@/types/chat';
import { formatMarkdown } from '@/utils/format';

import { useChat } from '../../composables/useChat';
import MessageActions from './MessageActions.vue';
import SourceReference from './SourceReference.vue';

interface Props {
  message: Message;
  conversationId?: string;
}

const props = defineProps<Props>();

const { copyMessage, toggleFeedback } = useChat({ conversationId: props.conversationId });

const isUser = computed(() => props.message.role === 'user');
const isStreaming = computed(() => Boolean(props.message.isStreaming));

const formattedContent = computed(() => {
  if (isUser.value) return props.message.content;
  return formatMarkdown(props.message.content);
});

const handleCopy = async (): Promise<void> => {
  try {
    await copyMessage(props.message.id);
  } catch (err) {
    console.error('複製失敗:', err);
  }
};

const handleFeedback = (kind: 'good' | 'bad'): void => {
  toggleFeedback(props.message.id, kind);
};
</script>

<style scoped>
/* ===== 整體 wrapper（每筆訊息） ===== */
.message-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  width: 100%;
  padding: 0 1rem;
  margin: 0 auto 1.75rem;
}

.message-wrapper-user {
  flex-direction: row-reverse;

  /* 使用者訊息：靠右並去掉頭像槽位 */
}

.message-wrapper-assistant {
  flex-direction: row;
}

/* ===== AI 頭像（葉子無背景） ===== */
.message-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-top: 0.125rem;
  color: var(--accent);
}

.avatar-leaf {
  width: 1.5rem;
  height: 1.5rem;
}

/* ===== 訊息主體 ===== */
.message-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.message-wrapper-assistant .message-body {
  flex: 1;
  align-items: flex-start;
  max-width: 100%;
}

.message-wrapper-user .message-body {
  align-items: flex-end;
  max-width: 70%;
}

/* ===== User：右靠輕泡泡 ===== */
.bubble-user {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--text);
  word-break: normal;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background-color: var(--bg-2);
  border-radius: var(--r-xl) var(--r-sm) var(--r-xl) var(--r-xl);
}

/* ===== AI：全寬無背景 ===== */
.message-assistant-content {
  width: 100%;
}

.message-markdown {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text);
  overflow-wrap: break-word;
}

/* 串流中游標效果 */
.message-markdown.is-streaming :deep(:last-child)::after {
  display: inline-block;
  width: 0.45rem;
  height: 1em;
  margin-left: 0.15rem;
  vertical-align: text-bottom;
  content: '';
  background-color: var(--accent);
  border-radius: 1px;
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* ===== Markdown 內容樣式 ===== */
.message-markdown :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.7;
}

.message-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.message-markdown :deep(h1),
.message-markdown :deep(h2),
.message-markdown :deep(h3) {
  margin-top: 1.25rem;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: var(--text);
}

.message-markdown :deep(h1:first-child),
.message-markdown :deep(h2:first-child),
.message-markdown :deep(h3:first-child) {
  margin-top: 0;
}

.message-markdown :deep(h1) {
  font-size: 1.5rem;
}

.message-markdown :deep(h2) {
  font-size: 1.25rem;
}

.message-markdown :deep(h3) {
  font-size: 1.125rem;
}

.message-markdown :deep(ul),
.message-markdown :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.message-markdown :deep(li) {
  margin-bottom: 0.375rem;
  line-height: 1.6;
}

.message-markdown :deep(pre) {
  position: relative;
  padding: 1rem;
  margin: 0.75rem 0;
  overflow-x: auto;
  background-color: var(--bg-hover);
  border-radius: var(--r-md);
}

.message-markdown :deep(pre code) {
  padding: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text);
  background-color: transparent;
}

.message-markdown :deep(code) {
  padding: 0.125rem 0.375rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  color: var(--accent);
  background-color: var(--bg-hover);
  border-radius: var(--r-xs);
}

.message-markdown :deep(a) {
  color: var(--accent);
  text-decoration: underline;
}

.message-markdown :deep(a:hover) {
  opacity: 0.8;
  transition: opacity 0.15s ease;
}

.message-markdown :deep(blockquote) {
  padding-left: 1rem;
  margin: 0.75rem 0;
  font-style: italic;
  color: var(--text-2);
  border-left: 3px solid var(--accent);
}

.message-markdown :deep(table) {
  width: 100%;
  margin: 0.75rem 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.message-markdown :deep(th),
.message-markdown :deep(td) {
  padding: 0.625rem 0.875rem;
  text-align: left;
  border: 1px solid var(--border);
}

.message-markdown :deep(th) {
  font-weight: 600;
  background-color: var(--bg-1);
}

.message-markdown :deep(tr:nth-child(even)) {
  background-color: var(--bg-1);
}

.message-markdown :deep(hr) {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid var(--border);
}

.message-markdown :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 0.75rem 0;
  border-radius: var(--r-md);
}

.message-markdown :deep(strong) {
  font-weight: 600;
  color: var(--text);
}

.message-markdown :deep(em) {
  font-style: italic;
}

/* ===== 響應式 ===== */
@media (width <= 768px) {
  .message-wrapper {
    padding: 0 0.75rem;
  }

  .message-wrapper-user .message-body {
    max-width: 85%;
  }

  .message-markdown :deep(pre) {
    font-size: 0.8125rem;
  }
}
</style>

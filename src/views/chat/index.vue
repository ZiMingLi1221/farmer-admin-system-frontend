<template>
  <div class="chat-page" :class="{ 'preview-open': isOpen }">
    <div ref="messagesContainerRef" class="chat-main-container scrollbar-custom">
      <main class="chat-content">
        <div class="chat-column">
          <ChatEmptyState
            v-if="!currentConversation || currentConversation.messages.length === 0"
            @select="handleSuggestionSelect"
          />

          <div v-else class="messages-list">
            <ChatMessage
              v-for="message in currentConversation.messages"
              :key="message.id"
              :message="message"
              :conversation-id="currentConversation.id"
            />

            <TypingIndicator v-if="chatStore.isLoading" />

            <div v-if="chatStore.error" class="error-message">
              <div class="error-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="ICONS.ERROR"
                  />
                </svg>
              </div>
              <div class="error-content">
                <p class="error-title">發生錯誤</p>
                <p class="error-description">{{ chatStore.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="messages-bottom-spacing" />
      </main>

      <div class="chat-sticky-bottom">
        <Transition name="scroll-button-fade">
          <IconBtn
            v-if="showScrollButton"
            icon="ARROW_DOWN"
            label="滾動到最新"
            class="scroll-to-bottom-button"
            aria-label="滾動到最新"
            @click="scrollToBottom(true)"
          />
        </Transition>

        <div class="chat-input-wrapper">
          <ChatInput ref="chatInputRef" :conversation-id="conversationId" />
        </div>
      </div>
    </div>

    <FilePreviewModal />
  </div>

  <Teleport
    v-if="currentConversation && currentConversation.messages.length > 0"
    to="#header-actions"
  >
    <button class="header-more-btn" aria-label="更多選項" @click.stop="toggleMoreMenu">⋮</button>
  </Teleport>

  <Teleport to="body">
    <div v-if="showMoreMenu" class="chat-context-menu" :style="moreMenuStyle">
      <button class="context-menu-item danger" @click="handleDeleteCurrent">
        <svg class="context-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.DELETE" />
        </svg>
        <span>刪除對話</span>
      </button>
    </div>
  </Teleport>

  <BaseModal v-model="showDeleteModal" title="刪除對話" size="sm" @close="cancelDelete">
    <p>確定要刪除此對話？此動作無法復原。</p>
    <template #footer>
      <button class="btn-cancel" @click="cancelDelete">取消</button>
      <button class="btn-danger" @click="confirmDelete">確認刪除</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseModal from '@/components/base/BaseModal.vue';
import IconBtn from '@/components/base/IconBtn.vue';
import { useFilePreview } from '@/composables/useFilePreview';
import { ICONS } from '@/constants/icons';
import { useChatStore } from '@/stores/chat';

import ChatInput from './components/inputs/ChatInput.vue';
import ChatEmptyState from './components/messages/ChatEmptyState.vue';
import ChatMessage from './components/messages/ChatMessage.vue';
import TypingIndicator from './components/messages/TypingIndicator.vue';
import FilePreviewModal from './components/modals/FilePreviewModal.vue';
import { useScrollControl } from './composables/useScrollControl';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const { isOpen, closePreview } = useFilePreview();

const conversationId = computed(() => route.params.id as string | undefined);
const currentConversation = computed(() =>
  conversationId.value ? chatStore.conversations.find((c) => c.id === conversationId.value) : null
);

watch(
  conversationId,
  (newId, oldId) => {
    if (newId) chatStore.setCurrentConversation(newId);
    // 切換對話時自動關閉預覽面板
    if (oldId !== undefined && newId !== oldId && isOpen.value) {
      closePreview();
    }
  },
  { immediate: true }
);

// 點建議卡 → 填入輸入框
const chatInputRef = ref<InstanceType<typeof ChatInput> | null>(null);
const handleSuggestionSelect = (text: string): void => {
  chatInputRef.value?.setText(text);
};

// Header ⋮ menu
const showMoreMenu = ref(false);
const moreMenuStyle = ref<{ top: string; right: string }>({ top: '0px', right: '0px' });
const showDeleteModal = ref(false);

const toggleMoreMenu = (e: MouseEvent): void => {
  const btn = e.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();
  moreMenuStyle.value = {
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  };
  showMoreMenu.value = !showMoreMenu.value;
};

const handleDeleteCurrent = (): void => {
  showMoreMenu.value = false;
  showDeleteModal.value = true;
};

const cancelDelete = (): void => {
  showDeleteModal.value = false;
};

const confirmDelete = (): void => {
  if (currentConversation.value) {
    chatStore.deleteConversation(currentConversation.value.id);
  }
  showDeleteModal.value = false;
  router.push('/chat');
};

const closeMenuOnOutsideClick = (): void => {
  showMoreMenu.value = false;
};

onMounted(() => window.addEventListener('click', closeMenuOnOutsideClick));
onUnmounted(() => window.removeEventListener('click', closeMenuOnOutsideClick));

// 滾動
const messagesContainerRef = ref<HTMLElement | null>(null);
const { showScrollButton, scrollToBottom, checkScrollPosition } =
  useScrollControl(messagesContainerRef);

watch(
  () => {
    const msgs = currentConversation.value?.messages;
    if (!msgs?.length) return '0|';
    const last = msgs[msgs.length - 1];
    return `${msgs.length}|${last.content}`;
  },
  async () => {
    await nextTick();
    await scrollToBottom(false);
    nextTick(() => checkScrollPosition());
  }
);
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg);
}

.chat-main-container {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  transition: opacity 0.3s ease;
  scroll-behavior: smooth;
}

@media (width <= 1024px) {
  .preview-open .chat-main-container {
    display: none;
  }
}

.chat-content {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
}

.chat-column {
  width: 100%;
  max-width: 48rem;
  padding: 0 1rem;
  margin: 0 auto;
}

.messages-list {
  padding: 1.5rem 0;
}

.messages-bottom-spacing {
  flex-shrink: 0;
  height: 140px;
}

.chat-sticky-bottom {
  position: sticky;
  bottom: 0;
  z-index: 30;
  margin-top: auto;
  pointer-events: none;
  background: transparent;
}

.chat-input-wrapper {
  position: relative;
  pointer-events: auto;
  background-color: var(--bg);
}

.chat-input-wrapper::before {
  position: absolute;
  top: -3rem;
  right: 0;
  left: 0;
  height: 3rem;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in srgb, var(--bg) 60%, transparent) 50%,
    var(--bg) 100%
  );
}

.scroll-to-bottom-button {
  position: absolute;
  top: -3.5rem;
  left: 50%;
  z-index: 20;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  color: var(--text);
  white-space: nowrap;
  pointer-events: auto;
  cursor: pointer;
  background-color: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  transform: translateX(-50%);
}

.scroll-button-fade-enter-active,
.scroll-button-fade-leave-active {
  transition: all 0.3s ease;
}

.scroll-button-fade-enter-from,
.scroll-button-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.error-message {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  padding: 0.875rem 1.125rem;
  margin: 1.25rem 0;
  background-color: color-mix(in srgb, var(--error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--error) 30%, transparent);
  border-radius: var(--r-lg);
}

.error-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--error);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-title {
  margin: 0 0 0.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--error);
}

.error-description {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-2);
}

/* Header ⋮ */
.header-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--text);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.header-more-btn:hover {
  background: var(--bg-hover);
}

.chat-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 8rem;
  padding: 0.375rem;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow:
    0 4px 12px rgb(0 0 0 / 15%),
    0 2px 4px rgb(0 0 0 / 10%);
}

.context-menu-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.context-menu-item.danger {
  color: var(--error);
}

.context-menu-item.danger:hover {
  background: color-mix(in srgb, var(--error) 10%, transparent);
  transition: background-color 0.15s ease;
}

.context-menu-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.btn-cancel,
.btn-danger {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: var(--r-md);
}

.btn-cancel {
  color: var(--text-2);
  background: transparent;
}

.btn-cancel:hover {
  color: var(--text);
  background: var(--bg-hover);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.btn-danger {
  color: white;
  background: var(--error);
}

.btn-danger:hover {
  background: var(--error-hover);
  transition: background-color 0.15s ease;
}

@media (width <= 768px) {
  .chat-column {
    padding: 0 0.5rem;
  }
}
</style>

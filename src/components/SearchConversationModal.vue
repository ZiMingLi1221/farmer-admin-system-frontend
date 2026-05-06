<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="props.open" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="search-input-wrapper">
            <svg
              class="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              ref="inputRef"
              v-model="searchQuery"
              class="search-input"
              placeholder="搜尋對話..."
              autocomplete="off"
            />
            <button class="close-btn" @click="close">✕</button>
          </div>
          <div class="divider"></div>

          <div class="results-list scrollbar-custom">
            <div v-if="filteredConversations.length === 0" class="empty-state">
              找不到符合的對話
            </div>
            <div
              v-for="(conv, index) in filteredConversations"
              :key="conv.id"
              class="result-item"
              :class="{ highlighted: highlightedIndex === index }"
              @click="selectConversation(conv.id)"
              @mouseenter="highlightedIndex = index"
            >
              <svg
                class="conv-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z"
                />
              </svg>
              <div class="conv-info">
                <span class="conv-title">{{ conv.title }}</span>
                <span class="conv-preview">{{ getPreview(conv) }}</span>
              </div>
              <span class="conv-time">{{ formatTime(conv.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useChatStore } from '@/stores/chat';
import type { Conversation } from '@/types/chat';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const chatStore = useChatStore();
const router = useRouter();

const searchQuery = ref('');
const highlightedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const filteredConversations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return chatStore.conversations;
  return chatStore.conversations.filter((c) => c.title.toLowerCase().includes(q));
});

watch(
  () => props.open,
  async (open) => {
    if (open) {
      searchQuery.value = '';
      highlightedIndex.value = 0;
      await nextTick();
      inputRef.value?.focus();
    }
  }
);

watch(filteredConversations, () => {
  highlightedIndex.value = 0;
});

const close = (): void => {
  emit('update:open', false);
};

const selectConversation = (id: string): void => {
  chatStore.setCurrentConversation(id);
  router.push(`/chat/${id}`);
  close();
};

const getPreview = (conv: Conversation): string => {
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return '';
  return last.content.length > 60 ? last.content.slice(0, 60) + '...' : last.content;
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const d = new Date(date);
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  if (isToday) return `今天 ${hh}:${mm}`;
  if (isYesterday) return `昨天 ${hh}:${mm}`;
  const yy = String(d.getFullYear()).slice(2);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}/${mo}/${dd}`;
};

const onKeydown = (e: KeyboardEvent): void => {
  if (!props.open) return;

  if (e.key === 'Escape') {
    close();
    return;
  }

  const total = filteredConversations.value.length;
  if (total === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value + 1) % total;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value - 1 + total) % total;
  } else if (e.key === 'Enter') {
    const conv = filteredConversations.value[highlightedIndex.value];
    if (conv) selectConversation(conv.id);
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  background: rgb(0 0 0 / 50%);
}

.modal-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgb(0 0 0 / 20%);
}

.search-input-wrapper {
  display: flex;
  flex-shrink: 0;
  gap: 0.75rem;
  align-items: center;
  padding: 0.875rem 1rem;
}

.search-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  padding: 0;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
  background: transparent;
  border: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.close-btn {
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
}

.close-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.divider {
  flex-shrink: 0;
  height: 1px;
  background-color: var(--border-primary);
}

.results-list {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
}

.empty-state {
  padding: 2rem 1rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  text-align: center;
}

.result-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  border-radius: 8px;
}

.result-item.highlighted {
  background-color: var(--bg-secondary);
}

.result-item:hover {
  background-color: var(--bg-secondary);
  transition: background-color 0.15s ease;
}

.conv-icon {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--text-tertiary);
}

.conv-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.conv-title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.conv-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.conv-time {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  opacity: 0;
}

.result-item:hover .conv-time {
  opacity: 1;
  transition: opacity 0.15s ease;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

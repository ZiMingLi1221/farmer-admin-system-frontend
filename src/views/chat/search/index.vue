<template>
  <div class="search-page">
    <div class="search-input-wrapper">
      <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.SEARCH" />
      </svg>
      <input
        ref="inputRef"
        v-model="searchQuery"
        class="search-input"
        placeholder="搜尋對話..."
        autocomplete="off"
      />
    </div>

    <div class="conv-list">
      <div v-if="filteredConversations.length === 0" class="empty-state">
        {{ searchQuery ? '找不到符合的對話' : '尚無對話紀錄' }}
      </div>
      <button
        v-for="conv in filteredConversations"
        :key="conv.id"
        class="conv-item"
        @click="selectConversation(conv.id)"
      >
        <span class="conv-title">{{ conv.title }}</span>
        <span class="conv-time">{{ formatTime(conv.updatedAt) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { ICONS } from '@/constants/icons';
import { useChatStore } from '@/stores/chat';

const router = useRouter();
const chatStore = useChatStore();

const searchQuery = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const filteredConversations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return chatStore.conversations;
  return chatStore.conversations.filter((c) => c.title.toLowerCase().includes(q));
});

const selectConversation = (id: string): void => {
  chatStore.setCurrentConversation(id);
  router.push(`/chat/${id}`);
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

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
});
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
  padding: 4rem 2rem 2rem;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  font-size: 1rem;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.conv-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 2rem 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

.conv-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-primary);
}

.conv-item:hover {
  background: var(--bg-secondary);
  transition: background-color 0.15s ease;
}

.conv-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.conv-time {
  flex-shrink: 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

@media (width <= 767px) {
  .search-page {
    padding: 2rem 1rem 1rem;
  }
}
</style>

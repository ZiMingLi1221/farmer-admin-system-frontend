<template>
  <div v-if="headerStore.tabs.length === 0" class="header-title">
    <h1 class="title-text">{{ displayTitle }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useChatStore } from '@/stores/chat';
import { useHeaderStore } from '@/stores/header';

const route = useRoute();
const chatStore = useChatStore();
const headerStore = useHeaderStore();

const displayTitle = computed(() => {
  if (route.name === 'chat' && route.params.id) {
    const conversationId = route.params.id as string;
    const conversation = chatStore.conversations.find((c) => c.id === conversationId);

    if (conversation && conversation.messages.length > 0) {
      const firstMessage = conversation.messages[0].content;
      return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    }

    return route.meta.title ?? 'AI 聊天';
  }

  return route.meta.title ?? '';
});

watch(displayTitle, (t) => {
  if (route.name === 'chat' && route.params.id && t && t !== 'AI 聊天') {
    document.title = `${t} - Farmer Admin System`;
  }
});
</script>

<style scoped>
.header-title {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.title-text {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
</style>

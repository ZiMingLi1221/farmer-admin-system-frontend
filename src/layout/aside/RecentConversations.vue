<template>
  <!-- 收合模式：只顯示圖示 -->
  <div v-if="sidebarStore.isCollapsed" class="collapsed-btn-wrapper">
    <button
      ref="collapsedBtnRef"
      class="collapsed-btn"
      @click="sidebarStore.toggleCollapsed()"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <svg class="collapsed-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </button>
    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="showTooltip" class="conv-tooltip" :style="tooltipStyle">
          最近對話
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <!-- 展開模式 -->
  <div v-else class="recent-section">
    <button class="section-header" @click="isSectionOpen = !isSectionOpen">
      <span class="section-title">最近對話</span>
      <svg
        class="chevron"
        :class="{ open: isSectionOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        width="16"
        height="16"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="isSectionOpen" class="conversation-list scrollbar-custom">
      <div v-if="chatStore.conversations.length === 0" class="empty-state">尚無對話</div>

      <div
        v-for="conv in visibleConversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: chatStore.currentConversationId === conv.id }"
        @click="handleConvClick(conv.id)"
        @mouseenter="handleItemMouseEnter($event, conv.title)"
        @mouseleave="handleItemMouseLeave"
      >
        <span class="conv-title">{{ conv.title }}</span>
      </div>

      <div ref="sentinelRef" class="sentinel"></div>
    </div>

    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="showItemTooltip" class="conv-tooltip" :style="itemTooltipStyle">
          {{ tooltipText }}
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useChatStore } from '@/stores/chat';
import { useSidebarStore } from '@/stores/sidebar';

const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const router = useRouter();

const isSectionOpen = ref(true);

// Collapsed tooltip
const collapsedBtnRef = ref<HTMLButtonElement | null>(null);
const showTooltip = ref(false);
const tooltipStyle = ref<Record<string, string>>({});
let tooltipTimer: number | null = null;

const clearTooltipTimer = (): void => {
  if (tooltipTimer !== null) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
};

const handleMouseEnter = (): void => {
  clearTooltipTimer();
  tooltipTimer = window.setTimeout(() => {
    if (collapsedBtnRef.value) {
      const rect = collapsedBtnRef.value.getBoundingClientRect();
      tooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 12}px`,
        transform: 'translateY(-50%)',
      };
      showTooltip.value = true;
    }
  }, 500);
};

const handleMouseLeave = (): void => {
  clearTooltipTimer();
  showTooltip.value = false;
};

// Item tooltips
const showItemTooltip = ref(false);
const itemTooltipStyle = ref<Record<string, string>>({});
const tooltipText = ref('');
let itemTooltipTimer: number | null = null;

const clearItemTooltipTimer = (): void => {
  if (itemTooltipTimer !== null) {
    clearTimeout(itemTooltipTimer);
    itemTooltipTimer = null;
  }
};

const handleItemMouseEnter = (event: MouseEvent, title: string): void => {
  clearItemTooltipTimer();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  itemTooltipTimer = window.setTimeout(() => {
    itemTooltipStyle.value = {
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.right + 12}px`,
      transform: 'translateY(-50%)',
    };
    tooltipText.value = title;
    showItemTooltip.value = true;
  }, 500);
};

const handleItemMouseLeave = (): void => {
  clearItemTooltipTimer();
  showItemTooltip.value = false;
};

// Conversation click
const handleConvClick = (id: string): void => {
  chatStore.setCurrentConversation(id);
  router.push(`/chat/${id}`);
};

// Lazy loading
const PAGE_SIZE = 20;
const displayCount = ref(PAGE_SIZE);
const visibleConversations = computed(() => chatStore.conversations.slice(0, displayCount.value));

const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && displayCount.value < chatStore.conversations.length) {
        displayCount.value = Math.min(
          displayCount.value + PAGE_SIZE,
          chatStore.conversations.length
        );
      }
    },
    { threshold: 0.1 }
  );
});

watch(
  sentinelRef,
  (el) => {
    if (el && observer) {
      observer.observe(el);
    }
  },
  { immediate: true }
);

watch(isSectionOpen, (open) => {
  if (!open) {
    clearItemTooltipTimer();
    showItemTooltip.value = false;
  }
});

watch(
  () => chatStore.conversations,
  () => {
    displayCount.value = PAGE_SIZE;
  },
  { flush: 'sync' }
);

onUnmounted(() => {
  observer?.disconnect();
  clearTooltipTimer();
  clearItemTooltipTimer();
});
</script>

<style scoped>
/* Collapsed mode */
.collapsed-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.collapsed-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  color: var(--text-secondary);
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.collapsed-btn:hover {
  color: var(--primary);
  background-color: var(--bg-tertiary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.collapsed-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
}

/* Expanded mode */
.recent-section {
  width: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.375rem 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.section-header:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chevron {
  flex-shrink: 0;
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(0deg);
}

.conversation-list {
  max-height: 300px;
  padding: 0.25rem 0;
  overflow: hidden auto;
}

.empty-state {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  text-align: center;
}

.conversation-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  background-color: transparent;
  border-radius: var(--radius-sm);
}

.conversation-item:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.conversation-item.active {
  color: var(--text-on-primary);
  background-color: var(--primary);
}

.conversation-item.active:hover {
  background-color: var(--primary-hover);
}

.conv-title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  white-space: nowrap;
}

.sentinel {
  height: 1px;
}

/* Tooltip */
.conv-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  pointer-events: none;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
}

.dark .conv-tooltip {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
}

.tooltip-arrow {
  position: absolute;
  top: 50%;
  right: 100%;
  width: 0;
  height: 0;
  border-color: transparent var(--bg-primary) transparent transparent;
  border-style: solid;
  border-width: 5px 6px 5px 0;
  transform: translateY(-50%);
}

.dark .tooltip-arrow {
  border-color: transparent var(--bg-tertiary) transparent transparent;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>

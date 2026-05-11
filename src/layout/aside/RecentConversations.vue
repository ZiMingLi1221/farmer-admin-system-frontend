<template>
  <div v-if="!sidebarStore.isCollapsed" class="recent-section">
    <button class="section-header" @click="isSectionOpen = !isSectionOpen">
      <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.CLOCK" />
      </svg>
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
        <button class="more-btn" title="更多選項" @click.stop="handleMoreClick($event, conv.id)">
          ⋮
        </button>
      </div>

      <div ref="sentinelRef" class="sentinel"></div>
    </div>

    <!-- Item hover tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="showItemTooltip" class="conv-tooltip" :style="itemTooltipStyle">
          {{ tooltipText }}
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- ⋮ Context menu -->
    <Teleport to="body">
      <div v-if="openMenuId !== null" class="conv-context-menu" :style="contextMenuStyle">
        <button class="context-menu-item danger" @click="handleDeleteConv">
          <svg class="context-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="ICONS.DELETE"
            />
          </svg>
          <span>刪除對話</span>
        </button>
      </div>
    </Teleport>

    <!-- 刪除確認 Modal -->
    <BaseModal v-model="showDeleteModal" title="刪除對話" size="sm" @close="cancelDelete">
      <p>確定要刪除此對話？此動作無法復原。</p>
      <template #footer>
        <button class="btn-cancel" @click="cancelDelete">取消</button>
        <button class="btn-danger" @click="confirmDelete">確認刪除</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import BaseModal from '@/components/base/BaseModal.vue';
import { ICONS } from '@/constants/icons';
import { useChatStore } from '@/stores/chat';
import { useSidebarStore } from '@/stores/sidebar';

const chatStore = useChatStore();
const sidebarStore = useSidebarStore();
const router = useRouter();

const isSectionOpen = ref(true);

// Item hover tooltips
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
  sidebarStore.closeMobileDrawer();
};

// ⋮ Context menu
const openMenuId = ref<string | null>(null);
const contextMenuStyle = ref<Record<string, string>>({});

const handleMoreClick = (event: MouseEvent, convId: string): void => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

  if (openMenuId.value === convId) {
    openMenuId.value = null;
    return;
  }

  contextMenuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  };
  openMenuId.value = convId;

  nextTick(() => {
    window.addEventListener('click', closeContextMenu, { once: true });
  });
};

const closeContextMenu = (): void => {
  openMenuId.value = null;
};

const showDeleteModal = ref(false);
const pendingDeleteId = ref<string | null>(null);

const handleDeleteConv = (): void => {
  if (openMenuId.value === null) return;
  pendingDeleteId.value = openMenuId.value;
  openMenuId.value = null;
  showDeleteModal.value = true;
};

const confirmDelete = (): void => {
  if (pendingDeleteId.value === null) return;
  const idToDelete = pendingDeleteId.value;
  chatStore.deleteConversation(idToDelete);
  if (chatStore.currentConversationId === idToDelete) {
    router.push('/chat');
  }
  pendingDeleteId.value = null;
  showDeleteModal.value = false;
};

const cancelDelete = (): void => {
  pendingDeleteId.value = null;
  showDeleteModal.value = false;
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
  clearItemTooltipTimer();
  window.removeEventListener('click', closeContextMenu);
});
</script>

<style scoped>
/* Expanded mode */
.recent-section {
  width: 100%;
}

.section-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.625rem;
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

.section-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.section-title {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
}

.chevron {
  flex-shrink: 0;
  transform: rotate(-90deg);

  /* transition 加在基礎樣式是因為這是旋轉動畫效果，非顏色/背景，不會導致主題切換黑閃 */
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
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  white-space: nowrap;
}

/* ⋮ 按鈕 */
.more-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
  color: var(--text-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  opacity: 0;
}

.conversation-item:hover .more-btn {
  opacity: 1;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
}

.more-btn:hover {
  background: var(--bg-overlay);
}

.conversation-item.active .more-btn {
  color: var(--text-on-primary);
  background: transparent;
  opacity: 1;
}

.conversation-item.active:hover .more-btn {
  opacity: 1;
}

.conversation-item.active .more-btn:hover {
  color: var(--text-on-primary);
  background: rgb(255 255 255 / 20%);
}

@media (width <= 767px) {
  .more-btn {
    opacity: 1;
  }
}

.sentinel {
  height: 1px;
}

/* Context menu popover */
.conv-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 8rem;
  padding: 0.375rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-sm);
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
  background-color: var(--bg-tertiary);
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

/* 刪除確認 Modal 按鈕 */
.btn-cancel,
.btn-danger {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
}

.btn-cancel {
  color: var(--text-secondary);
  background: transparent;
}

.btn-cancel:hover {
  color: var(--text-primary);
  background: var(--bg-overlay);
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
</style>

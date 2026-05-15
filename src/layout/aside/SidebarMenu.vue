<template>
  <div>
    <button
      ref="buttonRef"
      class="menu-button"
      :class="{
        active: isActive && !isNewChat,
        'new-chat-button': isNewChat,
        expanded: !isCollapsed,
      }"
      @click="handleClick"
      @mouseenter="!isCollapsed ? null : handleMouseEnter()"
      @mouseleave="!isCollapsed ? null : handleMouseLeave()"
    >
      <svg
        class="menu-icon"
        :class="{ 'new-chat-icon': isNewChat }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
      </svg>
      <span v-if="!isCollapsed" class="menu-label">{{ item.label }}</span>
    </button>

    <!-- Tooltip 只在收合狀態顯示 -->
    <Teleport v-if="isCollapsed" to="body">
      <Transition name="tooltip">
        <div v-if="showTooltip" class="menu-tooltip" :style="tooltipStyle">
          {{ item.label }}
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { MenuItem } from '@/types/sidebar';

interface Props {
  item: MenuItem;
  isActive?: boolean;
  isNewChat?: boolean;
  suppressTooltip?: boolean;
  isCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  isNewChat: false,
  suppressTooltip: false,
  isCollapsed: true,
});

interface Emits {
  (e: 'click', item: MenuItem): void;
}

const emit = defineEmits<Emits>();

const buttonRef = ref<HTMLButtonElement | null>(null);
const showTooltip = ref(false);
const tooltipStyle = ref({});
let tooltipTimer: number | null = null;

const handleClick = (): void => {
  clearTooltipTimer();
  showTooltip.value = false;
  emit('click', props.item);
};

const clearTooltipTimer = () => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
};

const handleMouseEnter = (): void => {
  if (props.suppressTooltip) return;

  clearTooltipTimer();
  tooltipTimer = window.setTimeout(() => {
    if (buttonRef.value) {
      const rect = buttonRef.value.getBoundingClientRect();
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
</script>

<style scoped>
.menu-button {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.625rem;
  color: var(--text-2);
  cursor: pointer;
  background-color: transparent;
  border: none;
  border-radius: var(--r-md);
}

.menu-button:hover {
  color: var(--text);
  background-color: var(--bg-sidebar-hover);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.menu-button.active {
  color: var(--text);
  background-color: var(--bg-sidebar-active);
}

.menu-button.active:hover:not(.disabled) {
  background-color: var(--bg-sidebar-active);
}

.menu-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
}

.menu-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
}

/* 新對話按鈕獨立樣式 */
.new-chat-button {
  color: var(--text-2);
  background-color: transparent;
}

.new-chat-button:hover {
  color: var(--text);
  background-color: var(--bg-sidebar-hover);
}

.new-chat-button:active {
  background-color: var(--bg-sidebar-active);
}

.new-chat-button:active .new-chat-icon {
  width: 1.15rem;
  height: 1.15rem;
}

/* Tooltip — 對齊全域：淺色黑底白字 / 深色白底黑字 */
.menu-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--tooltip-text);
  white-space: nowrap;
  pointer-events: none;
  background-color: var(--tooltip-bg);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-2);
}

.tooltip-arrow {
  position: absolute;
  top: 50%;
  right: 100%;
  width: 0;
  height: 0;
  border-color: transparent var(--tooltip-bg) transparent transparent;
  border-style: solid;
  border-width: 5px 6px 5px 0;
  transform: translateY(-50%);
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

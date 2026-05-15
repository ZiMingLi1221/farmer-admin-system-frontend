<template>
  <div class="logo-header" :class="{ collapsed: sidebarStore.isCollapsed }">
    <button
      ref="logoRef"
      class="logo-button"
      :aria-label="sidebarStore.isCollapsed ? '展開側邊欄' : '新對話'"
      @click="handleLogoClick"
      @mouseenter="handleLogoMouseEnter"
      @mouseleave="handleLogoMouseLeave"
    >
      <img :src="farmersLogo" class="logo-default" alt="" />
      <svg class="hamburger-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="ICONS.PANEL_LEFT"
        />
      </svg>
    </button>

    <button
      ref="collapseRef"
      class="collapse-btn"
      aria-label="收合側邊欄"
      tabindex="-1"
      @click="sidebarStore.toggleCollapsed()"
      @mouseenter="handleCollapseMouseEnter"
      @mouseleave="handleCollapseMouseLeave"
    >
      <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="ICONS.PANEL_LEFT"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="activeTooltip" class="menu-tooltip" :style="tooltipStyle">
          {{ activeTooltip }}
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import farmersLogo from '@/assets/images/national_farmers_logo.png';
import { ICONS } from '@/constants/icons';
import { useChatStore } from '@/stores/chat';
import { useSidebarStore } from '@/stores/sidebar';

const router = useRouter();
const sidebarStore = useSidebarStore();
const chatStore = useChatStore();

const logoRef = ref<HTMLButtonElement | null>(null);
const collapseRef = ref<HTMLButtonElement | null>(null);

const activeTooltip = ref<string | null>(null);
const tooltipStyle = ref<Record<string, string>>({});
let tooltipTimer: number | null = null;

const clearTooltipTimer = (): void => {
  if (tooltipTimer !== null) {
    clearTimeout(tooltipTimer);
    tooltipTimer = null;
  }
};

const showTooltip = (el: HTMLElement, text: string): void => {
  clearTooltipTimer();
  tooltipTimer = window.setTimeout(() => {
    const rect = el.getBoundingClientRect();
    tooltipStyle.value = {
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.right + 12}px`,
      transform: 'translateY(-50%)',
    };
    activeTooltip.value = text;
  }, 500);
};

const hideTooltip = (): void => {
  clearTooltipTimer();
  activeTooltip.value = null;
};

const handleLogoClick = (): void => {
  if (sidebarStore.isCollapsed) {
    sidebarStore.toggleCollapsed();
    return;
  }
  chatStore.setCurrentConversation(null);
  router.push('/chat');
};

const handleLogoMouseEnter = (): void => {
  if (!sidebarStore.isCollapsed || !logoRef.value) return;
  showTooltip(logoRef.value, '展開側邊欄');
};

const handleLogoMouseLeave = (): void => {
  hideTooltip();
};

const handleCollapseMouseEnter = (): void => {
  if (sidebarStore.isCollapsed || !collapseRef.value) return;
  showTooltip(collapseRef.value, '收合側邊欄');
};

const handleCollapseMouseLeave = (): void => {
  hideTooltip();
};

// 切換收合狀態時清掉殘留 tooltip
watch(
  () => sidebarStore.isCollapsed,
  () => {
    hideTooltip();
  }
);
</script>

<style scoped>
.logo-header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 0.75rem;
  overflow: hidden;
}

/* Logo 按鈕：左側固定位置，收合 / 展開皆同 */
.logo-button {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.logo-button:hover {
  background: var(--bg-sidebar-hover);
  transition: background-color 0.15s ease;
}

.logo-default {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.hamburger-hover {
  display: none;
  width: 1.25rem;
  height: 1.25rem;
}

/* 收合時 hover Logo → 顯示漢堡，提示可展開 */
.logo-header.collapsed .logo-button:hover .logo-default {
  display: none;
}

.logo-header.collapsed .logo-button:hover .hamburger-hover {
  display: block;
}

/* 收合 / 展開按鈕：展開時在右側，收合時向左淡出 */
.collapse-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: auto;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-btn:hover {
  background: var(--bg-sidebar-hover);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.logo-header.collapsed .collapse-btn {
  pointer-events: none;
  opacity: 0;
  transform: translateX(-100%);
}

.collapse-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (width <= 767px) {
  .collapse-btn {
    display: none;
  }
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

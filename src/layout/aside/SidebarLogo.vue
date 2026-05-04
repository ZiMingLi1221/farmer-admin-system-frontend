<template>
  <!-- 收合狀態：漢堡圖示 -->
  <button
    v-if="sidebarStore.isCollapsed"
    ref="hamburgerRef"
    class="hamburger-btn"
    aria-label="展開側邊欄"
    @click="sidebarStore.toggleCollapsed()"
    @mouseenter="handleHamburgerMouseEnter"
    @mouseleave="handleHamburgerMouseLeave"
  >
    <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>

    <!-- Hamburger Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="showHamburgerTooltip" class="menu-tooltip" :style="hamburgerTooltipStyle">
          展開側邊欄
          <div class="tooltip-arrow"></div>
        </div>
      </Transition>
    </Teleport>
  </button>

  <!-- 展開狀態：Logo + 系統名稱 + 收合按鈕 -->
  <div v-else class="logo-header">
    <button class="logo-button" title="返回首頁" @click="handleLogoClick">
      <img :src="farmersLogo" alt="農會 LOGO" class="logo-image" />
      <span class="system-name">汐農管理系統</span>
    </button>
    <button
      ref="collapseRef"
      class="collapse-btn"
      title="收合側邊欄"
      @click="sidebarStore.toggleCollapsed()"
      @mouseenter="handleCollapseMouseEnter"
      @mouseleave="handleCollapseMouseLeave"
    >
      <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>

      <!-- Collapse Tooltip -->
      <Teleport to="body">
        <Transition name="tooltip">
          <div v-if="showCollapseTooltip" class="menu-tooltip" :style="collapseTooltipStyle">
            收合側邊欄
            <div class="tooltip-arrow"></div>
          </div>
        </Transition>
      </Teleport>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import farmersLogo from '@/assets/images/national_farmers_logo.png';
import { useSidebarStore } from '@/stores/sidebar';

const router = useRouter();
const sidebarStore = useSidebarStore();

const hamburgerRef = ref<HTMLButtonElement | null>(null);
const collapseRef = ref<HTMLButtonElement | null>(null);
const showHamburgerTooltip = ref(false);
const showCollapseTooltip = ref(false);
const hamburgerTooltipStyle = ref({});
const collapseTooltipStyle = ref({});

let hamburgerTooltipTimer: number | null = null;
let collapseTooltipTimer: number | null = null;

const handleLogoClick = (): void => {
  router.push('/chat');
  sidebarStore.setActiveModule('conversation');
};

const clearHamburgerTooltipTimer = (): void => {
  if (hamburgerTooltipTimer) {
    clearTimeout(hamburgerTooltipTimer);
    hamburgerTooltipTimer = null;
  }
};

const clearCollapseTooltipTimer = (): void => {
  if (collapseTooltipTimer) {
    clearTimeout(collapseTooltipTimer);
    collapseTooltipTimer = null;
  }
};

const handleHamburgerMouseEnter = (): void => {
  clearHamburgerTooltipTimer();
  hamburgerTooltipTimer = window.setTimeout(() => {
    if (hamburgerRef.value) {
      const rect = hamburgerRef.value.getBoundingClientRect();
      hamburgerTooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 12}px`,
        transform: 'translateY(-50%)',
      };
      showHamburgerTooltip.value = true;
    }
  }, 500);
};

const handleHamburgerMouseLeave = (): void => {
  clearHamburgerTooltipTimer();
  showHamburgerTooltip.value = false;
};

const handleCollapseMouseEnter = (): void => {
  clearCollapseTooltipTimer();
  collapseTooltipTimer = window.setTimeout(() => {
    if (collapseRef.value) {
      const rect = collapseRef.value.getBoundingClientRect();
      collapseTooltipStyle.value = {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 12}px`,
        transform: 'translateY(-50%)',
      };
      showCollapseTooltip.value = true;
    }
  }, 500);
};

const handleCollapseMouseLeave = (): void => {
  clearCollapseTooltipTimer();
  showCollapseTooltip.value = false;
};
</script>

<style scoped>
/* 漢堡按鈕（收合狀態） */
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.hamburger-btn:hover {
  color: var(--text-primary);
  background: var(--bg-overlay);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tooltip */
.menu-tooltip {
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

.dark .menu-tooltip {
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

/* 展開狀態標頭 */
.logo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0.75rem;
}

/* Logo 按鈕 */
.logo-button {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  padding: 0.25rem;
  color: var(--text-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.logo-button:hover {
  background: var(--bg-overlay);
  transition: background-color 0.15s ease;
}

.logo-image {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
}

.system-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* 收合按鈕 */
.collapse-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--text-tertiary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-xs);
}

.collapse-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-overlay);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.collapse-icon {
  width: 1rem;
  height: 1rem;
}
</style>

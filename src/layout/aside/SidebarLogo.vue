<template>
  <!-- 收合狀態：漢堡圖示 -->
  <button
    v-if="sidebarStore.isCollapsed"
    class="hamburger-btn"
    aria-label="展開側邊欄"
    @click="sidebarStore.toggleCollapsed()"
  >
    <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  </button>

  <!-- 展開狀態：Logo + 收合按鈕 -->
  <div v-else class="logo-header">
    <button class="logo-button" title="返回首頁" @click="handleLogoClick">
      <img :src="farmersLogo" alt="農會 LOGO" class="logo-image" />
    </button>
    <button class="collapse-btn" title="收合側邊欄" @click="sidebarStore.toggleCollapsed()">
      <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import farmersLogo from '@/assets/images/national_farmers_logo.png';
import { useSidebarStore } from '@/stores/sidebar';

const router = useRouter();
const sidebarStore = useSidebarStore();

const handleLogoClick = (): void => {
  router.push('/chat');
  sidebarStore.setActiveModule('search-conversation');
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

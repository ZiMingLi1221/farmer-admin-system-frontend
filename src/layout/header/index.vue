<template>
  <header class="app-header">
    <!-- 漢堡按鈕：僅 mobile (<768px) 顯示，CSS 控制 -->
    <button
      class="header-hamburger"
      aria-label="開啟側邊欄"
      @click="sidebarStore.openMobileDrawer()"
    >
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          :d="ICONS.PANEL_LEFT"
        />
      </svg>
    </button>

    <!-- 中間區：tabs (store-driven) + title -->
    <div class="header-main">
      <nav v-if="headerStore.tabs.length > 0" class="header-nav">
        <router-link
          v-for="tab in headerStore.tabs"
          :key="tab.to"
          :to="tab.to"
          class="tab-link"
          :active-class="tab.activeClass ?? 'tab-link--active'"
        >
          {{ tab.label }}
        </router-link>
      </nav>
      <HeaderTitle />
    </div>

    <!-- 右側 actions teleport target -->
    <div id="header-actions" class="header-actions"></div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { ICONS } from '@/constants/icons';
import { useHeaderStore } from '@/stores/header';
import { useSidebarStore } from '@/stores/sidebar';

import HeaderTitle from './HeaderTitle.vue';

const sidebarStore = useSidebarStore();
const headerStore = useHeaderStore();
const { isCollapsed, displayWidth, liveSidebarWidth } = storeToRefs(sidebarStore);

const mainWidth = computed(() => (isCollapsed.value ? 64 : displayWidth.value));
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by v-bind() in <style scoped>
const headerMarginLeft = computed(() => `${mainWidth.value}px`);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by v-bind() in <style scoped>
const headerWidth = computed(() => `calc(100% - ${mainWidth.value}px)`);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by v-bind() in <style scoped>
const headerTransition = computed(() =>
  liveSidebarWidth.value !== null
    ? 'none'
    : 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
);
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 60;
  box-sizing: border-box;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  padding: 0 1.5rem;
  background-color: var(--bg-primary);
  transition: v-bind('headerTransition');
}

/* 寬螢幕：跟隨 sidebar 折疊狀態 */
@media (width >=1025px) {
  .app-header {
    width: v-bind('headerWidth');
    margin-left: v-bind('headerMarginLeft');
  }
}

/* 1024px 以下：sidebar 改為覆蓋模式，header 保持 64px 邊距 */
@media (width <=1024px) {
  .app-header {
    width: calc(100% - 64px);
    margin-left: 64px;
  }
}

/* 767px 以下：sidebar 完全隱藏，header 滿版 */
@media (width <=767px) {
  .app-header {
    width: 100%;
    padding: 0 1rem;
    margin-left: 0;
  }
}

/* 漢堡按鈕：預設隱藏，僅 mobile 顯示 */
.header-hamburger {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--text-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
}

.header-hamburger:hover {
  background: var(--bg-tertiary);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

@media (width <=767px) {
  .header-hamburger {
    display: flex;
  }
}

.header-main {
  display: flex;
  flex: 1;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
  align-items: stretch;
  height: 4rem;
}

.tab-link {
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease;
}

.tab-link:not(.tab-link--active):hover {
  color: var(--text-primary);
}

.tab-link--active {
  color: var(--text-primary);
  border-bottom-color: var(--primary);
}

@media (width <=767px) {
  .header-nav {
    gap: 1rem;
  }

  .tab-link {
    font-size: 0.9375rem;
  }
}

/* 右側 actions teleport target */
.header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.5rem;
  align-items: center;
}
</style>

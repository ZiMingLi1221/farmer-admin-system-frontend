<template>
  <header class="app-header">
    <HeaderTitle />
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useSidebarStore } from '@/stores/sidebar';

import HeaderTitle from './HeaderTitle.vue';

const sidebarStore = useSidebarStore();
const { isChatModule, isCollapsed, sidebarWidth } = storeToRefs(sidebarStore);

const mainWidth = computed(() => (isCollapsed.value ? 64 : sidebarWidth.value));
const sidebarTotalWidth = computed(() =>
  isChatModule.value ? mainWidth.value + 256 : mainWidth.value
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by v-bind() in <style scoped>
const headerMarginLeft = computed(() => `${sidebarTotalWidth.value}px`);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- consumed by v-bind() in <style scoped>
const headerWidth = computed(() => `calc(100% - ${sidebarTotalWidth.value}px)`);
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

  /* 只對 margin-left 與 width 做 transition，背景色排除在外以防主題切換黑閃 */
  transition:
    margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 寬螢幕：跟隨 sidebar 折疊狀態與 secondary 展開狀態 */
@media (width >= 1025px) {
  .app-header {
    width: v-bind('headerWidth');
    margin-left: v-bind('headerMarginLeft');
  }
}

/* 1024px 以下：sidebar 改為覆蓋模式，header 保持 64px 邊距避開折疊後的 MainSidebar */
@media (width <= 1024px) {
  .app-header {
    width: calc(100% - 64px);
    margin-left: 64px;
  }
}
</style>

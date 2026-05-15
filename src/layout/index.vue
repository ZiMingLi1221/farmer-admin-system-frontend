<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

import { useSidebarStore } from '@/stores/sidebar';

import AsideLayout from './aside/index.vue';
import HeaderLayout from './header/index.vue';
import MainLayout from './main/index.vue';

const sidebarStore = useSidebarStore();

// Mobile breakpoint detection
const isMobile = ref(false);

const updateIsMobile = (e: MediaQueryListEvent | MediaQueryList): void => {
  isMobile.value = e.matches;
};

let mql: MediaQueryList | null = null;

onMounted(() => {
  mql = window.matchMedia('(max-width: 767px)');
  isMobile.value = mql.matches;
  mql.addEventListener('change', updateIsMobile);
});

onUnmounted(() => {
  mql?.removeEventListener('change', updateIsMobile);
  window.removeEventListener('keydown', handleEsc);
});

// ESC key to close drawer
const handleEsc = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    sidebarStore.closeMobileDrawer();
  }
};

watch(
  () => isMobile.value && sidebarStore.isMobileDrawerOpen,
  (shouldListen) => {
    if (shouldListen) {
      window.addEventListener('keydown', handleEsc);
    } else {
      window.removeEventListener('keydown', handleEsc);
    }
  }
);
</script>

<template>
  <div class="layout-container">
    <!-- 側邊欄 -->
    <AsideLayout />

    <!-- Backdrop（mobile drawer 開啟時） -->
    <div
      v-if="isMobile && sidebarStore.isMobileDrawerOpen"
      class="mobile-backdrop"
      @click="sidebarStore.closeMobileDrawer()"
    />

    <!-- Header -->
    <HeaderLayout />

    <!-- 主內容區 -->
    <MainLayout :has-header="true" :is-mobile="isMobile" />
  </div>
</template>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg);
}

.mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 75;
  background: rgb(0 0 0 / 50%);
  transition: opacity 0.2s;
}
</style>
